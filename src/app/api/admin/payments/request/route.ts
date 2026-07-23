import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { createPaymentRequestAdmin } from "@/services/admin-payments.service";

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as { reservationId?: string };
    if (!body.reservationId) {
      return NextResponse.json({ error: "예약 ID가 필요합니다." }, { status: 400 });
    }

    return NextResponse.json(await createPaymentRequestAdmin(body.reservationId));
  } catch (error) {
    console.error("Failed to create admin payment request", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다." },
      { status: 400 },
    );
  }
}
