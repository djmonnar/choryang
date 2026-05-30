import { NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/session";
import { createReservationAdmin } from "@/services/reservations-admin.service";
import type { ReservationInput } from "@/types/reservation";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ReservationInput;
    const session = await getSessionPayload();
    const reservation = await createReservationAdmin(input, session?.userId);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation", error);
    return NextResponse.json({ error: "예약 처리 중 오류가 발생했습니다. 관리자에게 문의해 주세요." }, { status: 400 });
  }
}
