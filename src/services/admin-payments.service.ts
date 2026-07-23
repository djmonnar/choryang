import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Payment } from "@/types/payment";
import type { Reservation } from "@/types/reservation";

const PAYMENTS = "payments";
const RESERVATIONS = "reservations";

function makePaymentRequestId(reservation: Reservation) {
  const prefix = reservation.paymentMethod === "online" ? "choryang" : "bank";
  const normalized = reservation.reservationNumber.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 42);
  return `${prefix}_${normalized}_${Date.now().toString(36)}`.slice(0, 64);
}

export async function listPaymentsAdmin(): Promise<Payment[]> {
  const snapshot = await getAdminFirestore().collection(PAYMENTS).orderBy("requestedAt", "desc").get();
  return snapshot.docs.map((document) => document.data() as Payment);
}

export async function createPaymentRequestAdmin(reservationId: string) {
  const db = getAdminFirestore();
  const reservationRef = db.collection(RESERVATIONS).doc(reservationId);

  return db.runTransaction(async (transaction) => {
    const reservationSnapshot = await transaction.get(reservationRef);
    if (!reservationSnapshot.exists) throw new Error("예약을 찾을 수 없습니다.");

    const reservation = reservationSnapshot.data() as Reservation;
    const nextStatus = reservation.paymentMethod === "bank_transfer" ? "bank_waiting" : "payment_requested";

    if (reservation.status === nextStatus && reservation.paymentRequestId) {
      const existingPaymentRef = db.collection(PAYMENTS).doc(reservation.paymentRequestId);
      const existingPaymentSnapshot = await transaction.get(existingPaymentRef);
      if (existingPaymentSnapshot.exists) {
        return {
          payment: existingPaymentSnapshot.data() as Payment,
          reservation,
        };
      }
    }

    if (reservation.status !== "checking") {
      throw new Error("예약을 먼저 '관리자확인중'으로 변경한 뒤 결제를 요청해 주세요.");
    }
    if (reservation.totalAmount == null || reservation.totalAmount <= 0) {
      throw new Error("금액이 확정된 예약만 결제를 요청할 수 있습니다.");
    }

    const now = new Date().toISOString();
    const paymentId = makePaymentRequestId(reservation);
    const paymentRef = db.collection(PAYMENTS).doc(paymentId);
    const payment: Payment = {
      id: paymentId,
      reservationId: reservation.id,
      reservationNumber: reservation.reservationNumber,
      orderId: reservation.paymentMethod === "online" ? paymentId : undefined,
      paymentKey: null,
      method: reservation.paymentMethod,
      provider: reservation.paymentMethod === "online" ? "toss" : "bank",
      amount: reservation.totalAmount,
      status: reservation.paymentMethod === "online" ? "requested" : "bank_waiting",
      requestedAt: now,
      approvedAt: null,
      paidAt: null,
      cancelledAt: null,
      transactionId: null,
      virtualAccountInfo: reservation.paymentMethod === "bank_transfer" ? "마을 계좌 입금 대기" : null,
      memo: reservation.paymentMethod === "online" ? "고객 온라인결제 요청" : "고객 계좌입금 요청",
    };
    const updatedReservation: Reservation = {
      ...reservation,
      status: nextStatus,
      paymentRequestId: paymentId,
      paymentRequestedAt: now,
      updatedAt: now,
    };

    transaction.set(paymentRef, {
      ...payment,
      requestedAtServer: FieldValue.serverTimestamp(),
    });
    transaction.set(
      reservationRef,
      {
        status: nextStatus,
        paymentRequestId: paymentId,
        paymentRequestedAt: now,
        updatedAt: now,
        updatedAtServer: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { payment, reservation: updatedReservation };
  });
}

export async function confirmBankPaymentAdmin(paymentId: string) {
  const db = getAdminFirestore();
  const paymentRef = db.collection(PAYMENTS).doc(paymentId);

  return db.runTransaction(async (transaction) => {
    const paymentSnapshot = await transaction.get(paymentRef);
    if (!paymentSnapshot.exists) throw new Error("결제 요청을 찾을 수 없습니다.");

    const payment = paymentSnapshot.data() as Payment;
    if (payment.method !== "bank_transfer") throw new Error("계좌입금 예약만 수동으로 입금 확인할 수 있습니다.");

    const reservationRef = db.collection(RESERVATIONS).doc(payment.reservationId);
    const reservationSnapshot = await transaction.get(reservationRef);
    if (!reservationSnapshot.exists) throw new Error("예약을 찾을 수 없습니다.");

    const reservation = reservationSnapshot.data() as Reservation;
    if (payment.status === "paid" && reservation.status === "confirmed") {
      return { payment, reservation };
    }
    if (reservation.status !== "bank_waiting" && reservation.status !== "paid") {
      throw new Error("입금대기 상태의 예약만 입금 확인할 수 있습니다.");
    }

    const now = new Date().toISOString();
    const updatedPayment: Payment = {
      ...payment,
      status: "paid",
      approvedAt: now,
      paidAt: now,
    };
    const updatedReservation: Reservation = {
      ...reservation,
      status: "confirmed",
      confirmedAt: now,
      updatedAt: now,
    };

    transaction.set(
      paymentRef,
      {
        status: "paid",
        approvedAt: now,
        paidAt: now,
        updatedAt: now,
        updatedAtServer: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    transaction.set(
      reservationRef,
      {
        status: "confirmed",
        confirmedAt: now,
        updatedAt: now,
        updatedAtServer: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { payment: updatedPayment, reservation: updatedReservation };
  });
}
