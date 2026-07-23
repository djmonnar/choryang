import type { Product } from "@/types/product";

export interface ReservationCounts {
  adultCount: number;
  youthCount: number;
  childCount: number;
  preschoolCount?: number;
}

export function formatCurrency(value?: number | null) {
  if (value == null) return "문의 후 안내";
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(value);
}

export function formatPrice(product: Product) {
  if (product.priceNote) return product.priceNote;
  if (product.priceType === "inquiry") {
    if (product.basePrice != null && product.maxPrice != null) {
      return `${formatCurrency(product.basePrice)}~${formatCurrency(product.maxPrice)}`;
    }
    return "문의 후 안내";
  }
  if (product.priceType === "age_group") {
    const prices = [
      product.adultPrice != null ? `성인 ${formatCurrency(product.adultPrice)}` : "",
      product.youthPrice != null ? `청소년 ${formatCurrency(product.youthPrice)}` : "",
      product.preschoolPrice != null ? `유치원 ${formatCurrency(product.preschoolPrice)}` : "",
    ].filter(Boolean);
    return prices.join(" / ");
  }
  if (product.priceType === "per_person") return `${formatCurrency(product.basePrice)} / 1인`;
  return formatCurrency(product.basePrice);
}

export function calculateAmount(
  product: Product,
  counts: ReservationCounts,
  date?: string,
): number | null {
  const totalPeople = counts.adultCount + counts.youthCount + counts.childCount + (counts.preschoolCount ?? 0);
  if (product.priceType === "inquiry") return null;
  if (product.priceType === "age_group") {
    return (
      (product.adultPrice ?? 0) * counts.adultCount +
      (product.youthPrice ?? 0) * counts.youthCount +
      (product.childPrice ?? 0) * counts.childCount +
      (product.preschoolPrice ?? 0) * (counts.preschoolCount ?? 0)
    );
  }
  if (product.priceType === "per_person") {
    const month = date ? Number(date.slice(5, 7)) : null;
    const seasonalPrice = month
      ? product.seasonalPrices?.find((price) => price.months.includes(month))?.basePrice
      : undefined;
    return (seasonalPrice ?? product.basePrice ?? 0) * totalPeople;
  }

  const includedPeople = product.includedPeople ?? totalPeople;
  const extraPeople = Math.max(totalPeople - includedPeople, 0);
  return (product.basePrice ?? 0) + extraPeople * (product.extraPersonPrice ?? 0);
}

export function isProductAvailableOnDate(product: Product, date: string) {
  const month = Number(date.slice(5, 7));
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (product.availableMonths?.length && !product.availableMonths.includes(month)) return false;
  if (product.excludedMonths?.includes(month)) return false;
  return true;
}

export function getReservationCapacityUnits(product: Product, totalPeople: number) {
  return product.capacityType === "reservation" ? 1 : totalPeople;
}

export function toLocalDateText(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00+09:00`));
}

export function makeReservationNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `CR-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
