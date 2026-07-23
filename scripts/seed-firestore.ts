import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedNotices } from "../src/data/seedNotices";
import { retiredProductIds, seedProducts } from "../src/data/seedProducts";
import { seedSchedules } from "../src/data/seedSchedules";
import { siteSettings } from "../src/data/siteSettings";

dotenv.config({ path: ".env.local" });

const requiredEnv = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const;

function requireEnv(key: (typeof requiredEnv)[number]) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function getPrivateKey() {
  return requireEnv("FIREBASE_PRIVATE_KEY").replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

function initializeAdmin() {
  if (getApps()[0]) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getPrivateKey(),
    }),
  });
}

async function seedCollection<T extends { id: string }>(collectionName: string, items: T[]) {
  const db = getFirestore(initializeAdmin());
  const batch = db.batch();
  items.forEach((item) => {
    batch.set(db.collection(collectionName).doc(item.id), item, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${items.length} documents into ${collectionName}`);
}

async function seedSchedulesSafely() {
  const db = getFirestore(initializeAdmin());
  const refs = seedSchedules.map((schedule) => db.collection("schedules").doc(schedule.id));
  const existing = await db.getAll(...refs);
  const batch = db.batch();
  seedSchedules.forEach((schedule, index) => {
    batch.set(
      refs[index],
      existing[index]?.exists
        ? {
            ...schedule,
            reservedCount: existing[index]?.get("reservedCount") ?? schedule.reservedCount,
            status: existing[index]?.get("status") ?? schedule.status,
          }
        : schedule,
      { merge: true },
    );
  });
  await batch.commit();
  console.log(`Seeded ${seedSchedules.length} documents into schedules without resetting reservations`);
}

async function main() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing Firebase Admin environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  await seedCollection("products", seedProducts);
  await Promise.all(
    retiredProductIds.map((id) =>
      getFirestore(initializeAdmin()).collection("products").doc(id).set(
        {
          visible: false,
          bookingEnabled: false,
          updatedAt: new Date().toISOString(),
          retiredAt: new Date().toISOString(),
        },
        { merge: true },
      ),
    ),
  );
  console.log(`Retired ${retiredProductIds.length} removed products`);
  await seedSchedulesSafely();
  await seedCollection("notices", seedNotices);
  await getFirestore(initializeAdmin()).collection("siteSettings").doc("default").set(siteSettings, { merge: true });
  console.log("Seeded siteSettings/default");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
