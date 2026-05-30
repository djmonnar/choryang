import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { seedProducts } from "@/data/seedProducts";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { calculateAmount, makeReservationNumber } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import type { Reservation, ReservationInput, ReservationStatus } from "@/types/reservation";
import type { Schedule } from "@/types/schedule";

const RESERVATIONS = "reservations";
const SCHEDULES = "schedules";
const PRODUCTS = "products";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

async function getProductForReservation(productId: string): Promise<Product | null> {
  const snapshot = await getAdminFirestore().collection(PRODUCTS).doc(productId).get();
  if (snapshot.exists) return snapshot.data() as Product;
  return seedProducts.find((product) => product.id === productId) ?? null;
}

export async function listReservationsAdmin(): Promise<Reservation[]> {
  const snapshot = await getAdminFirestore().collection(RESERVATIONS).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as Reservation);
}

export async function getReservationAdmin(idOrNumber: string): Promise<Reservation | null> {
  const byId = await getAdminFirestore().collection(RESERVATIONS).doc(idOrNumber).get();
  if (byId.exists) return byId.data() as Reservation;

  const snapshot = await getAdminFirestore()
    .collection(RESERVATIONS)
    .where("reservationNumber", "==", idOrNumber.toUpperCase())
    .limit(1)
    .get();
  return snapshot.docs[0]?.data() as Reservation | null;
}

export async function listReservationsByUser(userId: string): Promise<Reservation[]> {
  const snapshot = await getAdminFirestore()
    .collection(RESERVATIONS)
    .where("userId", "==", userId)
    .get();
  return snapshot.docs
    .map((doc) => doc.data() as Reservation)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findReservationAdmin(reservationNumber: string, phone: string): Promise<Reservation | null> {
  const snapshot = await getAdminFirestore()
    .collection(RESERVATIONS)
    .where("reservationNumber", "==", reservationNumber.toUpperCase())
    .limit(1)
    .get();
  const reservation = snapshot.docs[0]?.data() as Reservation | undefined;
  if (!reservation) return null;
  return normalizePhone(reservation.phone) === normalizePhone(phone) ? reservation : null;
}

export async function createReservationAdmin(input: ReservationInput, userId?: string): Promise<Reservation> {
  const db = getAdminFirestore();
  const product = await getProductForReservation(input.productId);
  if (!product) throw new Error("선택한 체험을 찾을 수 없습니다.");

  const totalPeople = input.adultCount + input.youthCount + input.childCount;
  if (totalPeople <= 0) throw new Error("인원은 1명 이상이어야 합니다.");

  const reservationRef = db.collection(RESERVATIONS).doc();
  const scheduleRef = db.collection(SCHEDULES).doc(input.scheduleId);
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const scheduleSnapshot = await transaction.get(scheduleRef);
    if (!scheduleSnapshot.exists) throw new Error("선택한 회차를 찾을 수 없습니다.");

    const schedule = scheduleSnapshot.data() as Schedule;
    if (schedule.productId !== product.id) throw new Error("체험과 회차 정보가 일치하지 않습니다.");
    if (schedule.status !== "open") throw new Error("예약 가능한 회차가 아닙니다.");
    if (schedule.reservedCount + totalPeople > schedule.capacity) throw new Error("남은 정원을 초과했습니다.");

    const nextReservedCount = schedule.reservedCount + totalPeople;
    const reservation: Reservation = {
      ...input,
      userId,
      id: reservationRef.id,
      reservationNumber: makeReservationNumber(),
      productName: product.name,
      date: schedule.date,
      startTime: schedule.startTime,
      totalPeople,
      totalAmount: calculateAmount(product, input),
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    };

    transaction.set(reservationRef, reservation);
    transaction.update(scheduleRef, {
      reservedCount: nextReservedCount,
      status: nextReservedCount >= schedule.capacity ? "full" : schedule.status,
      updatedAt: now,
    });

    return reservation;
  });
}

export async function updateReservationStatusAdmin(id: string, status: ReservationStatus, adminMemo?: string) {
  const ref = getAdminFirestore().collection(RESERVATIONS).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("예약을 찾을 수 없습니다.");

  const updated: Reservation = {
    ...(snapshot.data() as Reservation),
    status,
    adminMemo,
    updatedAt: new Date().toISOString(),
  };
  await ref.set(
    {
      status,
      adminMemo,
      updatedAt: updated.updatedAt,
      updatedBy: "admin",
      updatedAtServer: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return updated;
}
