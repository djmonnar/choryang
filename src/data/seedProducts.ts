import type { Product, ProductCategory, Season } from "@/types/product";

const now = "2026-05-29T00:00:00.000Z";

const imageByCategory: Record<ProductCategory, string> = {
  water_ecology: "/images/choryang/stream-experience-01.jpg",
  making: "/images/choryang/food-service-01.jpg",
  farming: "/images/choryang/village-view-01.jpg",
  healing: "/images/choryang/education-center-01.jpg",
  food_info: "/images/choryang/food-table-01.jpg",
  stay_info: "/images/choryang/stay-01.jpg",
  product_sale: "/images/choryang/food-acorn-jelly-01.jpg",
};

const productImageById: Record<string, string> = {
  "daseulgi-fish": "/images/choryang/stream-experience-01.jpg",
  daseulgi: "/images/choryang/stream-experience-01.jpg",
  "water-play": "/images/choryang/hero-stream.jpg",
  raft: "/images/choryang/hero-stream.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  hangwa: "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "steamed-bread": "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "choco-muffin": "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "chocolat-cake": "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  sandwich: "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "mugwort-rice-cake": "/images/choryang/food-ssam-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "acorn-rice-cake": "/images/choryang/food-acorn-jelly-01.jpg",
  "acorn-jelly": "/images/choryang/food-acorn-jelly-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "blueberry-jam": "/images/choryang/food-service-01.jpg",
  // TODO: 정확한 상품 사진 확보 시 교체
  "doraji-jeonggwa": "/images/choryang/food-service-01.jpg",
  kkakdugi: "/images/choryang/food-kimchi-01.jpg",
  gochujang: "/images/choryang/food-red-side-01.jpg",
  "nature-table": "/images/choryang/food-table-01.jpg",
  "daseulgi-soup": "/images/choryang/food-single-01.jpg",
  "acorn-noodle": "/images/choryang/food-acorn-jelly-01.jpg",
  breakfast: "/images/choryang/food-table-01.jpg",
  "bean-room": "/images/choryang/stay-01.jpg",
  "gourd-room": "/images/choryang/stay-01.jpg",
  "sword-bean-room": "/images/choryang/stay-01.jpg",
  "jagal-hangwa": "/images/choryang/food-acorn-jelly-01.jpg",
  "doraji-sale": "/images/choryang/food-service-01.jpg",
};

type SeedInput = Partial<Product> & {
  id: string;
  name: string;
  category: ProductCategory;
  season?: Season;
};

function createProduct(input: SeedInput, sortOrder: number): Product {
  return {
    priceType: "inquiry",
    minPeople: 1,
    maxPeople: null,
    durationMinutes: 90,
    bookingEnabled: true,
    visible: true,
    description: `${input.name} 프로그램입니다. 자세한 운영 가능 여부와 인원은 문의 후 안내드립니다.`,
    caution: "체험은 계절 및 마을 사정에 따라 변동될 수 있습니다.",
    imageUrl: productImageById[input.id] ?? imageByCategory[input.category],
    tags: [],
    createdAt: now,
    updatedAt: now,
    sortOrder,
    season: "unknown",
    ...input,
  };
}

export const seedProducts: Product[] = [
  createProduct(
    {
      id: "daseulgi-fish",
      name: "다슬기잡이 및 물고기잡이",
      category: "water_ecology",
      season: "summer",
      priceType: "age_group",
      adultPrice: 20000,
      youthPrice: 10000,
      childPrice: 10000,
      description: "초량강에서 다슬기와 민물고기를 직접 만나보는 대표 생태체험입니다.",
      caution: "물가 체험이므로 여벌옷, 수건, 아쿠아슈즈를 준비해 주세요. 체험은 날씨와 수위에 따라 변경될 수 있습니다.",
      tags: ["대표체험", "물가체험", "가족"],
    },
    1,
  ),
  createProduct({ id: "daseulgi", name: "다슬기잡이체험", category: "water_ecology", season: "summer" }, 2),
  createProduct({ id: "water-play", name: "물놀이 체험", category: "water_ecology", season: "summer" }, 3),
  createProduct({ id: "raft", name: "뗏목타기", category: "water_ecology", season: "summer" }, 4),
  createProduct({ id: "hangwa", name: "한과만들기체험", category: "making", season: "all", priceType: "per_person", basePrice: 30000 }, 5),
  createProduct({ id: "steamed-bread", name: "찐빵만들기", category: "making", season: "all", priceType: "per_person", basePrice: 20000 }, 6),
  createProduct({ id: "choco-muffin", name: "초코머핀빵만들기", category: "making", season: "all", priceType: "per_person", basePrice: 10000 }, 7),
  createProduct({ id: "chocolat-cake", name: "쇼콜라케이크만들기", category: "making", season: "all", priceType: "per_person", basePrice: 15000 }, 8),
  createProduct({ id: "sandwich", name: "샌드위치만들기", category: "making", season: "all", priceType: "per_person", basePrice: 15000 }, 9),
  createProduct({ id: "mugwort-rice-cake", name: "쑥떡만들기", category: "making", season: "spring", priceType: "per_person", basePrice: 20000 }, 10),
  createProduct({ id: "acorn-rice-cake", name: "도토리떡만들기", category: "making", season: "autumn", priceType: "per_person", basePrice: 20000 }, 11),
  createProduct({ id: "acorn-jelly", name: "자연산 도토리묵만들기", category: "making", season: "autumn", priceType: "per_person", basePrice: 20000 }, 12),
  createProduct({ id: "blueberry-jam", name: "블루베리쨈만들기", category: "making", season: "summer", priceType: "per_person", basePrice: 20000 }, 13),
  createProduct({ id: "doraji-jeonggwa", name: "도라지정과만들기", category: "making", season: "all", priceType: "per_person", basePrice: 20000 }, 14),
  createProduct({ id: "kkakdugi", name: "깍두기담기체험", category: "making", season: "all", priceType: "per_person", basePrice: 20000 }, 15),
  createProduct({ id: "gochujang", name: "고추장 만들기 체험", category: "making", season: "all" }, 16),
  createProduct({ id: "chestnut", name: "알밤체험", category: "farming", season: "autumn", priceType: "per_person", basePrice: 12000, description: "10월에 운영되는 계절 수확 체험입니다." }, 17),
  createProduct({ id: "rice-planting", name: "모내기체험", category: "farming", season: "spring", priceType: "per_person", basePrice: 15000 }, 18),
  createProduct({ id: "rice-threshing", name: "벼 탈곡체험 및 쌀방아찧기", category: "farming", season: "autumn", priceType: "per_person", basePrice: 15000 }, 19),
  createProduct({ id: "potato", name: "감자캐기체험", category: "farming", season: "summer" }, 20),
  createProduct({ id: "strawberry", name: "딸기따기체험", category: "farming", season: "spring" }, 21),
  createProduct({ id: "moss-ball", name: "이끼볼, 남천, 마삭줄", category: "healing", season: "all", priceType: "per_person", basePrice: 15000 }, 22),
  createProduct({ id: "mind-rest", name: "멍때리기 체험", category: "healing", season: "all" }, 23),
  createProduct({ id: "nature-table", name: "자연밥상", category: "food_info", bookingEnabled: false, season: "unknown" }, 24),
  createProduct({ id: "daseulgi-soup", name: "다슬기탕", category: "food_info", priceType: "fixed", basePrice: 30000, bookingEnabled: false, season: "unknown" }, 25),
  createProduct({ id: "acorn-noodle", name: "도토리묵밥", category: "food_info", priceType: "per_person", basePrice: 15000, bookingEnabled: false, season: "unknown" }, 26),
  createProduct({ id: "breakfast", name: "조식", category: "food_info", bookingEnabled: false, season: "unknown" }, 27),
  createProduct({ id: "bean-room", name: "제비콩방", category: "stay_info", bookingEnabled: false, season: "unknown" }, 28),
  createProduct({ id: "gourd-room", name: "조롱박방", category: "stay_info", bookingEnabled: false, season: "unknown" }, 29),
  createProduct({ id: "sword-bean-room", name: "작두콩방", category: "stay_info", bookingEnabled: false, season: "unknown" }, 30),
  createProduct({ id: "hangwa-kit", name: "한과만들기체험키트", category: "product_sale", bookingEnabled: false, season: "unknown" }, 31),
  createProduct({ id: "jagal-hangwa", name: "자갈한과", category: "product_sale", priceType: "fixed", basePrice: 50000, bookingEnabled: false, season: "unknown", description: "1kg 50,000원, 500g 30,000원. 옵션 가격 구조가 필요하면 별도 fields로 처리합니다." }, 32),
  createProduct({ id: "doraji-sale", name: "도라지정과", category: "product_sale", priceType: "fixed", basePrice: 50000, bookingEnabled: false, season: "unknown" }, 33),
];
