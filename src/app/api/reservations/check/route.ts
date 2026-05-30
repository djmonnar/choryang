import { NextResponse } from "next/server";
import { findReservationAdmin } from "@/services/reservations-admin.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reservationNumber?: string; phone?: string };
    if (!body.reservationNumber || !body.phone) {
      return NextResponse.json({ reservation: null }, { status: 400 });
    }

    const reservation = await findReservationAdmin(body.reservationNumber, body.phone);
    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Failed to check reservation", error);
    return NextResponse.json({ error: "예약 조회 중 오류가 발생했습니다. 관리자에게 문의해 주세요." }, { status: 500 });
  }
}
