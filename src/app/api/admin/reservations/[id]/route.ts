import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getReservationAdmin, updateReservationStatusAdmin } from "@/services/reservations-admin.service";
import type { ReservationStatus } from "@/types/reservation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const { id } = await context.params;
    const reservation = await getReservationAdmin(id);
    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Failed to get admin reservation", error);
    return NextResponse.json({ error: "예약 상세 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: ReservationStatus; adminMemo?: string };
    if (!body.status) {
      return NextResponse.json({ error: "변경할 예약 상태가 필요합니다." }, { status: 400 });
    }

    const reservation = await updateReservationStatusAdmin(id, body.status, body.adminMemo);
    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Failed to update admin reservation", error);
    return NextResponse.json({ error: "예약 상태 변경 중 오류가 발생했습니다." }, { status: 500 });
  }
}
