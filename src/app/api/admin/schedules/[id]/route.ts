import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { updateScheduleAdmin } from "@/services/admin-catalog.service";
import type { Schedule } from "@/types/schedule";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const { id } = await context.params;
    const input = (await request.json()) as Partial<
      Pick<Schedule, "date" | "startTime" | "endTime" | "capacity" | "status" | "memo">
    >;
    return NextResponse.json({ schedule: await updateScheduleAdmin(id, input) });
  } catch (error) {
    console.error("Failed to update admin schedule", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "일정을 수정하지 못했습니다." },
      { status: 400 },
    );
  }
}
