import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { confirmBankPaymentAdmin } from "@/services/admin-payments.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as { action?: string };
    if (body.action !== "confirm_bank") {
      return NextResponse.json({ error: "지원하지 않는 결제 작업입니다." }, { status: 400 });
    }

    const { id } = await context.params;
    return NextResponse.json(await confirmBankPaymentAdmin(id));
  } catch (error) {
    console.error("Failed to update admin payment", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "입금 확인 중 오류가 발생했습니다." },
      { status: 400 },
    );
  }
}
