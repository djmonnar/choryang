import { NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/session";
import { listReservationsByUser } from "@/services/reservations-admin.service";

export async function GET() {
  try {
    const session = await getSessionPayload();
    if (!session?.userId) return NextResponse.json({ reservations: [] });

    const reservations = await listReservationsByUser(session.userId);
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Failed to list user reservations", error);
    return NextResponse.json({ error: "예약 조회 중 오류가 발생했습니다. 관리자에게 문의해 주세요." }, { status: 500 });
  }
}
