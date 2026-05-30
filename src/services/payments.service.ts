import { getPaymentProvider } from "@/lib/payment/providers";
import { updateReservationStatus } from "@/services/reservations.service";
import type { Payment } from "@/types/payment";
import type { Reservation } from "@/types/reservation";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.payments";

export function listPayments() {
  return readStorage<Payment[]>(KEY, []).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export async function createPaymentRequest(reservation: Reservation) {
  const provider = getPaymentProvider((process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as "mock") ?? "mock");
  const result = await provider.requestPayment({
    reservationId: reservation.id,
    reservationNumber: reservation.reservationNumber,
    amount: reservation.totalAmount ?? 0,
    customerName: reservation.customerName,
    phone: reservation.phone,
  });
  const payment: Payment = {
    id: result.paymentId,
    reservationId: reservation.id,
    method: reservation.paymentMethod,
    provider: result.provider,
    amount: reservation.totalAmount ?? 0,
    status: reservation.paymentMethod === "bank_transfer" ? "bank_waiting" : "requested",
    requestedAt: new Date().toISOString(),
    paidAt: null,
    cancelledAt: null,
    transactionId: null,
    virtualAccountInfo: reservation.paymentMethod === "bank_transfer" ? "관리자 설정 계좌로 입금 확인" : null,
    memo: "MockPaymentProvider로 생성된 결제 요청입니다.",
  };
  writeStorage(KEY, [payment, ...listPayments()]);
  await updateReservationStatus(reservation.id, reservation.paymentMethod === "bank_transfer" ? "bank_waiting" : "payment_requested");
  return payment;
}

export async function markPaymentPaid(paymentId: string) {
  const payments = listPayments();
  const target = payments.find((payment) => payment.id === paymentId);
  if (!target) throw new Error("결제 정보를 찾을 수 없습니다.");
  const updated: Payment = { ...target, status: "paid", paidAt: new Date().toISOString() };
  writeStorage(
    KEY,
    payments.map((payment) => (payment.id === paymentId ? updated : payment)),
  );
  await updateReservationStatus(target.reservationId, "paid");
  return updated;
}
