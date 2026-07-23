import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { createScheduleAdmin, listSchedulesAdmin } from "@/services/admin-catalog.service";
import type { Schedule } from "@/types/schedule";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    return NextResponse.json({ schedules: await listSchedulesAdmin() });
  } catch (error) {
    console.error("Failed to list admin schedules", error);
    return NextResponse.json({ error: "일정 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const input = (await request.json()) as Pick<Schedule, "productId" | "date" | "startTime" | "endTime" | "capacity"> & {
      memo?: string;
    };
    return NextResponse.json({ schedule: await createScheduleAdmin(input) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin schedule", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "일정을 등록하지 못했습니다." },
      { status: 400 },
    );
  }
}
