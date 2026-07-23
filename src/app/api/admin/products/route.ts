import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { listProductsAdmin } from "@/services/admin-catalog.service";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    return NextResponse.json({ products: await listProductsAdmin() });
  } catch (error) {
    console.error("Failed to list admin products", error);
    return NextResponse.json({ error: "상품 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
