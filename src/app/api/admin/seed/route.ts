import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { seedOperationalCatalogAdmin } from "@/services/admin-catalog.service";

export async function POST() {
  const admin = await requireAdminSession();
  if (!admin.ok) return admin.response;

  try {
    return NextResponse.json({ result: await seedOperationalCatalogAdmin() });
  } catch (error) {
    console.error("Failed to seed operational catalog", error);
    return NextResponse.json({ error: "최신 기본 데이터를 반영하지 못했습니다." }, { status: 500 });
  }
}
