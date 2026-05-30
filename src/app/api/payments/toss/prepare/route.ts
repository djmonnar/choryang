import { NextResponse } from "next/server";
import { prepareTossPayment } from "@/services/toss-payments-admin.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reservationId?: string; reservationNumber?: string; phone?: string };
    if (!body.reservationId) {
      return NextResponse.json({ error: "예약 ID가 필요합니다." }, { status: 400 });
    }

    const payment = await prepareTossPayment({
      reservationId: body.reservationId,
      reservationNumber: body.reservationNumber,
      phone: body.phone,
    });
    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Failed to prepare Toss payment", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "결제 준비 중 오류가 발생했습니다." }, { status: 400 });
  }
}
