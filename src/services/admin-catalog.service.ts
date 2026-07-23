import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { seedNotices } from "@/data/seedNotices";
import { retiredProductIds, seedProducts } from "@/data/seedProducts";
import { seedSchedules } from "@/data/seedSchedules";
import { siteSettings } from "@/data/siteSettings";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Product } from "@/types/product";
import type { Schedule, ScheduleStatus } from "@/types/schedule";

const PRODUCTS = "products";
const SCHEDULES = "schedules";
const ADMIN_LOGS = "adminLogs";

async function writeAdminLog(action: string, targetId: string, details: Record<string, unknown>) {
  await getAdminFirestore().collection(ADMIN_LOGS).add({
    action,
    targetId,
    details,
    createdAt: new Date().toISOString(),
    createdAtServer: FieldValue.serverTimestamp(),
  });
}

export async function listProductsAdmin(): Promise<Product[]> {
  const snapshot = await getAdminFirestore().collection(PRODUCTS).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updateProductAdmin(id: string, input: Partial<Product>): Promise<Product> {
  const db = getAdminFirestore();
  const ref = db.collection(PRODUCTS).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("상품을 찾을 수 없습니다.");

  const allowed: Array<keyof Product> = [
    "name",
    "category",
    "season",
    "priceType",
    "adultPrice",
    "youthPrice",
    "childPrice",
    "preschoolPrice",
    "basePrice",
    "maxPrice",
    "priceNote",
    "priceOptions",
    "minPeople",
    "maxPeople",
    "durationMinutes",
    "bookingEnabled",
    "visible",
    "description",
    "caution",
    "tags",
    "sortOrder",
  ];
  const update = Object.fromEntries(
    allowed
      .filter((key) => input[key] !== undefined)
      .map((key) => [key, input[key]]),
  ) as Partial<Product>;
  update.updatedAt = new Date().toISOString();

  await ref.set({ ...update, updatedAtServer: FieldValue.serverTimestamp() }, { merge: true });
  await writeAdminLog("product.update", id, update as Record<string, unknown>);
  return { ...(snapshot.data() as Product), ...update, id };
}

export async function listSchedulesAdmin(): Promise<Schedule[]> {
  const snapshot = await getAdminFirestore().collection(SCHEDULES).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Schedule)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

export async function createScheduleAdmin(
  input: Pick<Schedule, "productId" | "date" | "startTime" | "endTime" | "capacity"> & { memo?: string },
): Promise<Schedule> {
  if (!input.productId || !input.date || !input.startTime || !input.endTime) throw new Error("상품, 날짜, 시작·종료 시간을 모두 입력해 주세요.");
  if (!Number.isInteger(input.capacity) || input.capacity < 1) throw new Error("정원은 1 이상이어야 합니다.");

  const db = getAdminFirestore();
  const product = await db.collection(PRODUCTS).doc(input.productId).get();
  if (!product.exists || !(product.data() as Product).bookingEnabled) throw new Error("예약 가능한 상품을 선택해 주세요.");

  const ref = db.collection(SCHEDULES).doc();
  const now = new Date().toISOString();
  const schedule: Schedule = {
    id: ref.id,
    productId: input.productId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    capacity: input.capacity,
    reservedCount: 0,
    status: "open",
    memo: input.memo?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };
  await ref.set({ ...schedule, createdAtServer: FieldValue.serverTimestamp(), updatedAtServer: FieldValue.serverTimestamp() });
  await writeAdminLog("schedule.create", ref.id, schedule as unknown as Record<string, unknown>);
  return schedule;
}

export async function updateScheduleAdmin(
  id: string,
  input: Partial<Pick<Schedule, "date" | "startTime" | "endTime" | "capacity" | "status" | "memo">>,
): Promise<Schedule> {
  const db = getAdminFirestore();
  const ref = db.collection(SCHEDULES).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("일정을 찾을 수 없습니다.");

  const current = { id, ...snapshot.data() } as Schedule;
  const capacity = input.capacity ?? current.capacity;
  if (!Number.isInteger(capacity) || capacity < 1) throw new Error("정원은 1 이상이어야 합니다.");
  if (capacity < current.reservedCount) throw new Error(`이미 ${current.reservedCount}명이 예약되어 있어 그보다 작게 줄일 수 없습니다.`);

  let status: ScheduleStatus = input.status ?? current.status;
  if (status === "open" && current.reservedCount >= capacity) status = "full";
  if (status === "full" && current.reservedCount < capacity) status = "open";

  const update = {
    ...(input.date !== undefined ? { date: input.date } : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.memo !== undefined ? { memo: input.memo.trim() } : {}),
    capacity,
    status,
    updatedAt: new Date().toISOString(),
  };
  await ref.set({ ...update, updatedAtServer: FieldValue.serverTimestamp() }, { merge: true });
  await writeAdminLog("schedule.update", id, update);
  return { ...current, ...update };
}

export async function seedOperationalCatalogAdmin() {
  const db = getAdminFirestore();
  const scheduleRefs = seedSchedules.map((schedule) => db.collection(SCHEDULES).doc(schedule.id));
  const existingSchedules = await db.getAll(...scheduleRefs);
  const batch = db.batch();

  seedProducts.forEach((product) => {
    batch.set(db.collection(PRODUCTS).doc(product.id), product, { merge: true });
  });
  retiredProductIds.forEach((id) => {
    batch.set(
      db.collection(PRODUCTS).doc(id),
      { visible: false, bookingEnabled: false, retiredAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { merge: true },
    );
  });
  seedSchedules.forEach((schedule, index) => {
    const existing = existingSchedules[index];
    batch.set(
      scheduleRefs[index],
      existing?.exists
        ? {
            ...schedule,
            reservedCount: existing.get("reservedCount") ?? schedule.reservedCount,
            status: existing.get("status") ?? schedule.status,
          }
        : schedule,
      { merge: true },
    );
  });
  seedNotices.forEach((notice) => {
    batch.set(db.collection("notices").doc(notice.id), notice, { merge: true });
  });
  batch.set(db.collection("siteSettings").doc("default"), siteSettings, { merge: true });
  await batch.commit();
  await writeAdminLog("catalog.seed", "operational-defaults", {
    products: seedProducts.length,
    schedules: seedSchedules.length,
    notices: seedNotices.length,
    retiredProducts: retiredProductIds.length,
  });

  return {
    products: seedProducts.length,
    schedules: seedSchedules.length,
    notices: seedNotices.length,
    retiredProducts: retiredProductIds.length,
  };
}
