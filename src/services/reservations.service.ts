import { getProduct } from "@/services/products.service";
import { reserveCapacity } from "@/services/schedules.service";
import { calculateAmount, makeReservationNumber } from "@/lib/utils/format";
import type { Reservation, ReservationInput, ReservationStatus } from "@/types/reservation";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.reservations";

export function listReservations() {
  return readStorage<Reservation[]>(KEY, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReservation(idOrNumber: string) {
  return (
    listReservations().find(
      (reservation) => reservation.id === idOrNumber || reservation.reservationNumber === idOrNumber.toUpperCase(),
    ) ?? null
  );
}

export function findReservation(reservationNumber: string, phone: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  return (
    listReservations().find(
      (reservation) =>
        reservation.reservationNumber === reservationNumber.toUpperCase() &&
        reservation.phone.replace(/\D/g, "") === normalizedPhone,
    ) ?? null
  );
}

export function createReservation(input: ReservationInput) {
  const product = getProduct(input.productId);
  if (!product) throw new Error("선택한 체험을 찾을 수 없습니다.");
  const totalPeople = input.adultCount + input.youthCount + input.childCount;
  if (totalPeople <= 0) throw new Error("인원은 1명 이상이어야 합니다.");
  reserveCapacity(input.scheduleId, totalPeople);
  const now = new Date().toISOString();
  const reservation: Reservation = {
    ...input,
    id: crypto.randomUUID(),
    reservationNumber: makeReservationNumber(),
    productName: product.name,
    totalPeople,
    totalAmount: calculateAmount(product, input),
    status: "submitted",
    createdAt: now,
    updatedAt: now,
  };
  writeStorage(KEY, [reservation, ...listReservations()]);
  return reservation;
}

export function updateReservationStatus(id: string, status: ReservationStatus, adminMemo?: string) {
  const reservations = listReservations();
  const target = reservations.find((reservation) => reservation.id === id);
  if (!target) throw new Error("예약을 찾을 수 없습니다.");
  const updated: Reservation = { ...target, status, adminMemo, updatedAt: new Date().toISOString() };
  writeStorage(
    KEY,
    reservations.map((reservation) => (reservation.id === id ? updated : reservation)),
  );
  return updated;
}
