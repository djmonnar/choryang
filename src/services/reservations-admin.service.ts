import "server-only";

import type { Transaction } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { seedProducts } from "@/data/seedProducts";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { calculateAmount, makeReservationNumber } from "@/lib/utils/format";
import { getReservationItems } from "@/lib/utils/reservationItems";
import type { Product } from "@/types/product";
import type { Reservation, ReservationInput, ReservationItem, ReservationItemInput, ReservationStatus } from "@/types/reservation";
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

function getInputItems(input: ReservationInput): ReservationItemInput[] {
  if (input.items?.length) return input.items;
  if (!input.productId || !input.scheduleId) return [];

  return [
    {
      productId: input.productId,
      productName: input.productName,
      scheduleId: input.scheduleId,
      date: input.date,
      startTime: input.startTime,
      adultCount: input.adultCount ?? 0,
      youthCount: input.youthCount ?? 0,
      childCount: input.childCount ?? 0,
    },
  ];
}

function assertNoTimeConflict(items: ReservationItem[]) {
  const ranges = new Set<string>();
  for (const item of items) {
    const key = `${item.date}-${item.startTime}-${item.endTime}`;
    if (ranges.has(key)) throw new Error("같은 시간대 체험은 중복 선택할 수 없습니다.");
    ranges.add(key);
  }
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

  let restored = false;
  for (const item of getReservationItems(reservation)) {
    const scheduleRef = getAdminFirestore().collection(SCHEDULES).doc(item.scheduleId);
    const scheduleSnapshot = await transaction.get(scheduleRef);
    if (!scheduleSnapshot.exists) continue;

    const schedule = scheduleSnapshot.data() as Schedule;
    transaction.set(scheduleRef, restoreCapacityUpdate(schedule, item.totalPeople), { merge: true });
    restored = true;
  }
  return restored;
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
  const inputItems = getInputItems(input);
  if (inputItems.length === 0) throw new Error("최소 1개 이상의 체험을 선택해 주세요.");

  const reservationRef = db.collection(RESERVATIONS).doc();
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const items: ReservationItem[] = [];
    const scheduleUpdates: Array<{ ref: FirebaseFirestore.DocumentReference; schedule: Schedule; item: ReservationItem }> = [];

    for (const inputItem of inputItems) {
      const productRef = db.collection(PRODUCTS).doc(inputItem.productId);
      const scheduleRef = db.collection(SCHEDULES).doc(inputItem.scheduleId);
      const [productSnapshot, scheduleSnapshot] = await Promise.all([transaction.get(productRef), transaction.get(scheduleRef)]);

      const product = productSnapshot.exists ? (productSnapshot.data() as Product) : await getProductForReservation(inputItem.productId);
      if (!product) throw new Error("선택한 체험을 찾을 수 없습니다.");
      if (!scheduleSnapshot.exists) throw new Error("선택한 회차를 찾을 수 없습니다.");

      const schedule = scheduleSnapshot.data() as Schedule;
      if (schedule.productId !== product.id) throw new Error("체험과 회차 정보가 일치하지 않습니다.");
      if (schedule.status !== "open") throw new Error(`${product.name} 회차는 예약 가능한 상태가 아닙니다.`);

      const totalPeople = inputItem.adultCount + inputItem.youthCount + inputItem.childCount;
      if (totalPeople <= 0) throw new Error("인원은 1명 이상이어야 합니다.");
      if (schedule.reservedCount + totalPeople > schedule.capacity) throw new Error(`${product.name} 회차의 남은 정원을 초과했습니다.`);

      const item: ReservationItem = {
        productId: product.id,
        productName: product.name,
        scheduleId: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        adultCount: inputItem.adultCount,
        youthCount: inputItem.youthCount,
        childCount: inputItem.childCount,
        totalPeople,
        amount: calculateAmount(product, inputItem),
      };
      items.push(item);
      scheduleUpdates.push({ ref: scheduleRef, schedule, item });
    }

    assertNoTimeConflict(items);

    const visitDates = [...new Set(items.map((item) => item.date))];
    if (visitDates.length !== 1) throw new Error("한 번의 예약 신청은 같은 방문 날짜의 체험만 선택할 수 있습니다.");

    const totalAmount = items.some((item) => item.amount == null) ? null : items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    const totalPeople = Math.max(...items.map((item) => item.totalPeople));
    const firstItem = items[0];

    const reservation: Reservation = {
      id: reservationRef.id,
      userId,
      reservationNumber: makeReservationNumber(),
      items,
      productId: firstItem.productId,
      productName: items.length === 1 ? firstItem.productName : `${firstItem.productName} 외 ${items.length - 1}개`,
      scheduleId: firstItem.scheduleId,
      date: firstItem.date,
      startTime: firstItem.startTime,
      visitDate: firstItem.date,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      adultCount: firstItem.adultCount,
      youthCount: firstItem.youthCount,
      childCount: firstItem.childCount,
      totalPeople,
      totalAmount,
      paymentMethod: input.paymentMethod,
      status: "submitted",
      depositorName: input.depositorName,
      refundBankName: input.refundBankName,
      refundAccountNumber: input.refundAccountNumber,
      refundAccountHolder: input.refundAccountHolder,
      requestMemo: input.requestMemo,
      adminMemo: input.adminMemo,
      privacyAgreed: input.privacyAgreed,
      cautionAgreed: input.cautionAgreed,
      capacityRestored: false,
      cancelledAt: null,
      cancelledBy: null,
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    for (const { ref, schedule, item } of scheduleUpdates) {
      const nextReservedCount = schedule.reservedCount + item.totalPeople;
      transaction.update(ref, {
        reservedCount: nextReservedCount,
        status: nextReservedCount >= schedule.capacity ? "full" : schedule.status,
        updatedAt: now,
      });
    }

    transaction.set(reservationRef, reservation);
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
