import { NextResponse } from "next/server";
import { markNaverUserDisconnected } from "@/services/users.service";

async function readDisconnectPayload(request: Request) {
  const url = new URL(request.url);
  const queryNaverId = url.searchParams.get("naverId") || url.searchParams.get("id") || url.searchParams.get("user_id");

  if (request.method === "GET") {
    return { naverId: queryNaverId, raw: Object.fromEntries(url.searchParams.entries()) };
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      naverId: String(body.naverId ?? body.id ?? body.user_id ?? queryNaverId ?? ""),
      raw: body,
    };
  }

  const formData = await request.formData().catch(() => null);
  if (formData) {
    return {
      naverId: String(formData.get("naverId") ?? formData.get("id") ?? formData.get("user_id") ?? queryNaverId ?? ""),
      raw: Object.fromEntries(formData.entries()),
    };
  }

  return { naverId: queryNaverId, raw: Object.fromEntries(url.searchParams.entries()) };
}

async function handleDisconnect(request: Request) {
  const payload = await readDisconnectPayload(request);
  const naverId = payload.naverId?.trim();

  if (naverId) {
    try {
      await markNaverUserDisconnected(naverId);
    } catch (error) {
      console.error("Failed to mark Naver user disconnected", error);
    }
  }

  console.info("Naver disconnect callback received", payload.raw);
  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  return handleDisconnect(request);
}

export async function POST(request: Request) {
  return handleDisconnect(request);
}
