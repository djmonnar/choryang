import "server-only";

import { seedProducts } from "@/data/seedProducts";
import { seedSchedules } from "@/data/seedSchedules";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Product } from "@/types/product";
import type { Schedule } from "@/types/schedule";

const PRODUCTS = "products";
const SCHEDULES = "schedules";

function canUseDevelopmentSeed() {
  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)
  );
}

export async function listPublicProducts(): Promise<Product[]> {
  if (canUseDevelopmentSeed()) {
    return seedProducts.filter((product) => product.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const snapshot = await getAdminFirestore().collection(PRODUCTS).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    .filter((product) => product.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listPublicSchedules(productId?: string): Promise<Schedule[]> {
  if (canUseDevelopmentSeed()) {
    return seedSchedules
      .filter((schedule) => !productId || schedule.productId === productId)
      .filter((schedule) => schedule.status === "open" || schedule.status === "full")
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }
  const collection = getAdminFirestore().collection(SCHEDULES);
  const snapshot = productId
    ? await collection.where("productId", "==", productId).get()
    : await collection.get();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Schedule)
    .filter((schedule) => schedule.date >= today && (schedule.status === "open" || schedule.status === "full"))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}
