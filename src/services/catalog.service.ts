import type { Product } from "@/types/product";
import type { Schedule } from "@/types/schedule";

async function parseCatalogResponse<T>(response: Response, key: string): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(data.error || "데이터를 불러오는 중 오류가 발생했습니다.");
  return data[key] as T;
}

export async function listPublicProducts() {
  return parseCatalogResponse<Product[]>(await fetch("/api/products/public", { credentials: "include" }), "products");
}

export async function listPublicSchedules(productId?: string) {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  return parseCatalogResponse<Schedule[]>(await fetch(`/api/schedules/public${query}`, { credentials: "include" }), "schedules");
}
