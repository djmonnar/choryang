import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { updateProductAdmin } from "@/services/admin-catalog.service";
import type { Product } from "@/types/product";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    const { id } = await context.params;
    const input = (await request.json()) as Partial<Product>;
    return NextResponse.json({ product: await updateProductAdmin(id, input) });
  } catch (error) {
    console.error("Failed to update admin product", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "상품을 수정하지 못했습니다." },
      { status: 400 },
    );
  }
}
