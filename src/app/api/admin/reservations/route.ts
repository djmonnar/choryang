import { NextResponse } from "next/server";
import { listReservationsAdmin } from "@/services/reservations-admin.service";

export async function GET() {
  try {
    const reservations = await listReservationsAdmin();
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Failed to list admin reservations", error);
    return NextResponse.json({ error: "예약 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
