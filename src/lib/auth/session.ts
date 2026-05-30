import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getUserById } from "@/services/users.service";
import type { ChoryangUser, PublicUser } from "@/types/user";
import { toPublicUser } from "@/types/user";

export const authSessionCookieName = "choryang_session";
export const naverStateCookieName = "choryang_naver_state";
export const authReturnToCookieName = "choryang_auth_return_to";

interface SessionPayload {
  userId: string;
  provider: "naver";
  naverId: string;
  exp: number;
}

const maxAge = 60 * 60 * 24 * 14;

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || process.env.NAVER_CLIENT_SECRET || "choryang-dev-session-secret";
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = base64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function decodeSession(value?: string): SessionPayload | null {
  if (!value) return null;
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) return null;
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

export async function setAuthSession(user: ChoryangUser) {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    userId: user.id,
    provider: "naver",
    naverId: user.naverId,
    exp: Date.now() + maxAge * 1000,
  };
  cookieStore.set(authSessionCookieName, encodeSession(payload), {
    ...cookieOptions(),
    maxAge,
  });
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.set(authSessionCookieName, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}

export async function getSessionPayload() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(authSessionCookieName)?.value);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  const user = await getUserById(payload.userId);
  return user ? toPublicUser(user) : null;
}

export function getNaverStateCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: 60 * 5,
  };
}
