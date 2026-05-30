import { NextResponse } from "next/server";
import { listPublicSchedules } from "@/services/public-catalog.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") ?? undefined;
    const schedules = await listPublicSchedules(productId);
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Failed to list public schedules", error);
    return NextResponse.json({ error: "체험 일정을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
