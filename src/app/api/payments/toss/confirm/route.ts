import { NextResponse } from "next/server";
import { confirmTossPayment } from "@/services/toss-payments-admin.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { paymentKey?: string; orderId?: string; amount?: number | string };
    const amount = Number(body.amount);
    if (!body.paymentKey || !body.orderId || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "결제 승인 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const result = await confirmTossPayment({ paymentKey: body.paymentKey, orderId: body.orderId, amount });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to confirm Toss payment", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "결제 승인 중 오류가 발생했습니다." }, { status: 400 });
  }
}
