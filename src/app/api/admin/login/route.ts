import { NextResponse } from "next/server";
import { setAdminSession, verifyAdminCredentials } from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; secret?: string };
    if (!verifyAdminCredentials(body)) {
      return NextResponse.json({ error: "관리자 계정을 확인해 주세요." }, { status: 403 });
    }

    await setAdminSession(body.email || "admin");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "관리자 로그인 설정을 확인해 주세요." }, { status: 500 });
  }
}
