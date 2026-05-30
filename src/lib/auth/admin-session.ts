import "server-only";

import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const adminSessionCookieName = "choryang_admin_session";
const maxAge = 60 * 60 * 8;

interface AdminSessionPayload {
  email: string;
  role: "admin";
  exp: number;
}

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    console.error("[Admin Auth] Missing required environment variable: ADMIN_SECRET");
    throw new Error("ADMIN_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("base64url");
}

function encodeSession(payload: AdminSessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(value?: string): AdminSessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSessionPayload;
    if (payload.role !== "admin" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    adminSessionCookieName,
    encodeSession({
      email,
      role: "admin",
      exp: Date.now() + maxAge * 1000,
    }),
    {
      ...cookieOptions(),
      maxAge,
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(adminSessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}

export function verifyAdminCredentials(input: { email?: string; password?: string; secret?: string }) {
  const adminSecret = getAdminSecret();
  if (input.secret && input.secret === adminSecret) return true;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminPasswordHash) {
    console.error("[Admin Auth] ADMIN_EMAIL/ADMIN_PASSWORD_HASH are missing. Secret login is still available when ADMIN_SECRET is set.");
    return false;
  }

  if (!input.email || !input.password || input.email !== adminEmail) return false;
  const inputHash = createHash("sha256").update(input.password).digest("hex");
  const expectedBuffer = Buffer.from(adminPasswordHash);
  const inputBuffer = Buffer.from(inputHash);
  return expectedBuffer.length === inputBuffer.length && timingSafeEqual(expectedBuffer, inputBuffer);
}
