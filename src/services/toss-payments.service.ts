import type { Reservation } from "@/types/reservation";

export interface TossPrepareResult {
  clientKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  reservationId: string;
  reservationNumber: string;
  checkoutUrl: string | null;
}

async function parsePaymentResponse<T>(response: Response, key?: string): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };
  if (!response.ok) throw new Error(data.error || "결제 처리 중 오류가 발생했습니다.");
  return (key ? data[key] : data) as T;
}

export async function prepareTossPayment(reservation: Reservation, phone?: string) {
  return parsePaymentResponse<TossPrepareResult>(
    await fetch("/api/payments/toss/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        phone,
      }),
    }),
    "payment",
  );
}

export async function confirmTossPayment(input: { paymentKey: string; orderId: string; amount: number }) {
  return parsePaymentResponse(
    await fetch("/api/payments/toss/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    }),
  );
}
