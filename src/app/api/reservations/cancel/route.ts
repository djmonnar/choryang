import { NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/session";
import { cancelReservationAdmin } from "@/services/reservations-admin.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      reservationId?: string;
      reservationNumber?: string;
      phone?: string;
      cancelReason?: string;
    };
    const session = await getSessionPayload();

    if (!body.reservationId && (!body.reservationNumber || !body.phone)) {
      return NextResponse.json({ error: "예약 ID 또는 예약번호와 연락처가 필요합니다." }, { status: 400 });
    }

    if (body.reservationId && !session?.userId && (!body.reservationNumber || !body.phone)) {
      return NextResponse.json({ error: "비회원 예약은 예약번호와 연락처로 취소 요청해 주세요." }, { status: 400 });
    }

    const reservation = await cancelReservationAdmin({
      reservationId: body.reservationId,
      reservationNumber: body.reservationNumber,
      phone: body.phone,
      userId: session?.userId,
      cancelReason: body.cancelReason,
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Failed to cancel reservation", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "예약 취소 요청 중 오류가 발생했습니다." }, { status: 400 });
  }
}
