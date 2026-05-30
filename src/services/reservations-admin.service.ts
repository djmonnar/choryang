import "server-only";

import type { Transaction } from "firebase-admin/firestore";
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
const CUSTOMER_DIRECT_CANCEL_STATUSES: ReservationStatus[] = ["submitted", "checking", "payment_requested", "bank_waiting"];
const CUSTOMER_REFUND_REQUEST_STATUSES: ReservationStatus[] = ["paid", "confirmed"];

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function appendAdminMemo(current: string | undefined, line: string) {
  return [current, line].filter(Boolean).join("\n");
}

function restoreCapacityUpdate(schedule: Schedule, totalPeople: number) {
  const reservedCount = Math.max((schedule.reservedCount ?? 0) - totalPeople, 0);
  return {
    reservedCount,
    status: schedule.status === "full" ? "open" : schedule.status,
    updatedAt: new Date().toISOString(),
    updatedAtServer: FieldValue.serverTimestamp(),
  };
}

async function restoreCapacityInTransaction(transaction: Transaction, reservation: Reservation) {
  if (reservation.capacityRestored) return false;
  const scheduleRef = getAdminFirestore().collection(SCHEDULES).doc(reservation.scheduleId);
  const scheduleSnapshot = await transaction.get(scheduleRef);
  if (!scheduleSnapshot.exists) return false;

  const schedule = scheduleSnapshot.data() as Schedule;
  transaction.set(scheduleRef, restoreCapacityUpdate(schedule, reservation.totalPeople), { merge: true });
  return true;
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
      capacityRestored: false,
      cancelledAt: null,
      cancelledBy: null,
      refundedAt: null,
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
  const db = getAdminFirestore();
  const reservationRef = db.collection(RESERVATIONS).doc(id);
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reservationRef);
    if (!snapshot.exists) throw new Error("예약을 찾을 수 없습니다.");

    const current = snapshot.data() as Reservation;
    const update: Partial<Reservation> = {
      status,
      updatedAt: now,
    };
    if (adminMemo !== undefined) update.adminMemo = adminMemo;
    const dbUpdate: Partial<Reservation> & Record<string, unknown> = {
      ...update,
      updatedBy: "admin",
      updatedAtServer: FieldValue.serverTimestamp(),
    };

    if (status === "cancelled") {
      const restored = await restoreCapacityInTransaction(transaction, current);
      update.cancelledAt = current.cancelledAt ?? now;
      update.cancelledBy = current.cancelledBy ?? "admin";
      update.capacityRestored = current.capacityRestored || restored;
      if (adminMemo) update.cancelReason = adminMemo;
    }

    if (status === "refunded") {
      update.refundedAt = now;
    }

    Object.assign(dbUpdate, update);
    transaction.set(reservationRef, dbUpdate, { merge: true });
    return { ...current, ...update } as Reservation;
  });
}

export async function cancelReservationAdmin(input: {
  reservationId?: string;
  reservationNumber?: string;
  phone?: string;
  userId?: string;
  cancelReason?: string;
}): Promise<Reservation> {
  const db = getAdminFirestore();
  let reservationId = input.reservationId;

  if (!reservationId && input.reservationNumber) {
    const snapshot = await db
      .collection(RESERVATIONS)
      .where("reservationNumber", "==", input.reservationNumber.toUpperCase())
      .limit(1)
      .get();
    reservationId = snapshot.docs[0]?.id;
  }

  if (!reservationId) throw new Error("예약 정보를 찾을 수 없습니다.");

  const reservationRef = db.collection(RESERVATIONS).doc(reservationId);
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reservationRef);
    if (!snapshot.exists) throw new Error("예약 정보를 찾을 수 없습니다.");

    const current = snapshot.data() as Reservation;
    if (input.userId) {
      if (current.userId !== input.userId) throw new Error("예약 취소 권한을 확인할 수 없습니다.");
    } else {
      if (!input.reservationNumber || !input.phone) throw new Error("예약번호와 연락처가 필요합니다.");
      if (current.reservationNumber !== input.reservationNumber.toUpperCase() || normalizePhone(current.phone) !== normalizePhone(input.phone)) {
        throw new Error("예약 취소 권한을 확인할 수 없습니다.");
      }
    }

    const cancelReason = input.cancelReason?.trim() || undefined;
    const update: Partial<Reservation> = {
      updatedAt: now,
    };
    const dbUpdate: Partial<Reservation> & Record<string, unknown> = {
      ...update,
      updatedAtServer: FieldValue.serverTimestamp(),
    };

    if (CUSTOMER_DIRECT_CANCEL_STATUSES.includes(current.status)) {
      const restored = await restoreCapacityInTransaction(transaction, current);
      update.status = "cancelled";
      update.cancelledAt = now;
      update.cancelledBy = "customer";
      update.capacityRestored = current.capacityRestored || restored;
      if (cancelReason) update.cancelReason = cancelReason;
      if (cancelReason) update.adminMemo = appendAdminMemo(current.adminMemo, `고객 취소 사유: ${cancelReason}`);
    } else if (CUSTOMER_REFUND_REQUEST_STATUSES.includes(current.status)) {
      update.status = "refund_requested";
      update.cancelledBy = "customer";
      update.capacityRestored = current.capacityRestored ?? false;
      if (cancelReason) update.cancelReason = cancelReason;
      update.adminMemo = appendAdminMemo(
        current.adminMemo,
        `고객 환불 요청${cancelReason ? `: ${cancelReason}` : ""} - 결제/확정된 예약은 관리자 확인 후 환불 처리됩니다.`,
      );
    } else {
      throw new Error("현재 상태에서는 고객 취소 요청을 할 수 없습니다.");
    }

    Object.assign(dbUpdate, update);
    transaction.set(reservationRef, dbUpdate, { merge: true });
    return { ...current, ...update } as Reservation;
  });
}
