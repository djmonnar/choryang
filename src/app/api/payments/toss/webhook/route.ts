import { NextResponse } from "next/server";
import { handleTossWebhook } from "@/services/toss-payments-admin.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleTossWebhook(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to handle Toss webhook", error);
    return NextResponse.json({ error: "웹훅 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
