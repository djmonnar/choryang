import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { listPaymentsAdmin } from "@/services/admin-payments.service";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const payments = await listPaymentsAdmin();
    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Failed to list admin payments", error);
    return NextResponse.json({ error: "결제 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
