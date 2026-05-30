import type { Reservation, ReservationInput, ReservationStatus } from "@/types/reservation";

async function parseReservationResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { reservation?: Reservation; reservations?: Reservation[]; error?: string };
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") window.location.href = "/admin/login";
    }
    throw new Error(data.error || "예약 처리 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
  }
  return data;
}

export async function listReservations() {
  const data = await parseReservationResponse(await fetch("/api/admin/reservations", { credentials: "include" }));
  return data.reservations ?? [];
}

export async function listMyReservations() {
  const data = await parseReservationResponse(await fetch("/api/reservations/mine", { credentials: "include" }));
  return data.reservations ?? [];
}

export async function getReservation(idOrNumber: string) {
  const data = await parseReservationResponse(await fetch(`/api/admin/reservations/${encodeURIComponent(idOrNumber)}`, { credentials: "include" }));
  return data.reservation ?? null;
}

export async function findReservation(reservationNumber: string, phone: string) {
  const data = await parseReservationResponse(
    await fetch("/api/reservations/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reservationNumber, phone }),
    }),
  );
  return data.reservation ?? null;
}

export async function createReservation(input: ReservationInput) {
  const data = await parseReservationResponse(
    await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }),
  );
  if (!data.reservation) throw new Error("예약 처리 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
  return data.reservation;
}

export async function updateReservationStatus(id: string, status: ReservationStatus, adminMemo?: string) {
  const data = await parseReservationResponse(
    await fetch(`/api/admin/reservations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, adminMemo }),
    }),
  );
  if (!data.reservation) throw new Error("예약 처리 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
  return data.reservation;
}
