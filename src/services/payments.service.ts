import type { Payment } from "@/types/payment";
import type { Reservation } from "@/types/reservation";

interface PaymentApiResponse {
  payment?: Payment;
  payments?: Payment[];
  reservation?: Reservation;
  error?: string;
}

async function parsePaymentResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as PaymentApiResponse;
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") window.location.href = "/admin/login";
    }
    throw new Error(data.error || "결제 처리 중 오류가 발생했습니다.");
  }
  return data;
}

export async function listPayments() {
  const data = await parsePaymentResponse(
    await fetch("/api/admin/payments", {
      credentials: "include",
      cache: "no-store",
    }),
  );
  return data.payments ?? [];
}

export async function createPaymentRequest(reservation: Reservation) {
  const data = await parsePaymentResponse(
    await fetch("/api/admin/payments/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reservationId: reservation.id }),
    }),
  );
  if (!data.payment || !data.reservation) throw new Error("결제 요청 결과를 확인할 수 없습니다.");
  return { payment: data.payment, reservation: data.reservation };
}

export async function markPaymentPaid(paymentId: string) {
  const data = await parsePaymentResponse(
    await fetch(`/api/admin/payments/${encodeURIComponent(paymentId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "confirm_bank" }),
    }),
  );
  if (!data.payment || !data.reservation) throw new Error("입금 확인 결과를 확인할 수 없습니다.");
  return { payment: data.payment, reservation: data.reservation };
}
