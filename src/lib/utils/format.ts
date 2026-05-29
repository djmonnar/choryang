import type { Product } from "@/types/product";

export function formatCurrency(value?: number | null) {
  if (value == null) return "문의 후 안내";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);
}

export function formatPrice(product: Product) {
  if (product.priceType === "inquiry") return "문의 후 안내";
  if (product.priceType === "age_group") {
    return `성인 ${formatCurrency(product.adultPrice)} / 학생·어린이 ${formatCurrency(product.childPrice)}`;
  }
  if (product.priceType === "per_person") return `${formatCurrency(product.basePrice)} / 1인`;
  return formatCurrency(product.basePrice);
}

export function calculateAmount(
  product: Product,
  counts: { adultCount: number; youthCount: number; childCount: number },
): number | null {
  const totalPeople = counts.adultCount + counts.youthCount + counts.childCount;
  if (product.priceType === "inquiry") return null;
  if (product.priceType === "age_group") {
    return (
      (product.adultPrice ?? 0) * counts.adultCount +
      (product.youthPrice ?? 0) * counts.youthCount +
      (product.childPrice ?? 0) * counts.childCount
    );
  }
  if (product.priceType === "per_person") return (product.basePrice ?? 0) * totalPeople;
  return product.basePrice ?? 0;
}

export function toLocalDateText(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00+09:00`));
}

export function makeReservationNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `CR-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
