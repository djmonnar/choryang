import { NextResponse } from "next/server";
import { listPublicProducts } from "@/services/public-catalog.service";

export async function GET() {
  try {
    const products = await listPublicProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to list public products", error);
    return NextResponse.json({ error: "체험 상품을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}
