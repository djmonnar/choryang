import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Product } from "@/types/product";
import type { Schedule } from "@/types/schedule";

const PRODUCTS = "products";
const SCHEDULES = "schedules";

export async function listPublicProducts(): Promise<Product[]> {
  const snapshot = await getAdminFirestore().collection(PRODUCTS).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    .filter((product) => product.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listPublicSchedules(productId?: string): Promise<Schedule[]> {
  const collection = getAdminFirestore().collection(SCHEDULES);
  const snapshot = productId
    ? await collection.where("productId", "==", productId).get()
    : await collection.get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Schedule)
    .filter((schedule) => schedule.status === "open" || schedule.status === "full")
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}
