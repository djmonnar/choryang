export type ProductCategory =
  | "water_ecology"
  | "making"
  | "farming"
  | "healing"
  | "food_info"
  | "stay_info"
  | "product_sale";

export type Season = "spring" | "summer" | "autumn" | "winter" | "all" | "unknown";

export type PriceType = "per_person" | "age_group" | "fixed" | "inquiry";
export type CapacityType = "people" | "reservation";

export interface SeasonalPrice {
  months: number[];
  basePrice: number;
  label: string;
}

export interface ProductPriceOption {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  season: Season;
  priceType: PriceType;
  adultPrice?: number | null;
  youthPrice?: number | null;
  childPrice?: number | null;
  preschoolPrice?: number | null;
  basePrice?: number | null;
  maxPrice?: number | null;
  priceNote?: string;
  priceOptions?: ProductPriceOption[];
  seasonalPrices?: SeasonalPrice[];
  availableMonths?: number[];
  excludedMonths?: number[];
  preschoolAllowed?: boolean;
  capacityType?: CapacityType;
  includedPeople?: number | null;
  extraPersonPrice?: number | null;
  minPeople?: number | null;
  maxPeople?: number | null;
  durationMinutes?: number | null;
  bookingEnabled: boolean;
  visible: boolean;
  description: string;
  caution?: string;
  imageUrl: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const productCategoryLabels: Record<ProductCategory, string> = {
  water_ecology: "생태·물놀이",
  making: "만들기 체험",
  farming: "농촌·수확 체험",
  healing: "식물·힐링 체험",
  food_info: "식사 안내",
  stay_info: "숙박 안내",
  product_sale: "특산물",
};

export const seasonLabels: Record<Season, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
  all: "연중",
  unknown: "확인필요",
};

export const priceTypeLabels: Record<PriceType, string> = {
  per_person: "1인 기준",
  age_group: "연령별",
  fixed: "고정가",
  inquiry: "문의 후 안내",
};
