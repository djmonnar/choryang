import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getSessionPayload } from "@/lib/auth/session";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { Payment } from "@/types/payment";
import type { Reservation } from "@/types/reservation";

const PAYMENTS = "payments";
const RESERVATIONS = "reservations";
const TOSS_API_BASE = "https://api.tosspayments.com";

interface TossPrepareInput {
  reservationId: string;
  reservationNumber?: string;
  phone?: string;
}

interface TossConfirmInput {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface TossWebhookBody {
  paymentKey?: string;
  orderId?: string;
  data?: {
    paymentKey?: string;
    orderId?: string;
  };
}

function normalizePhone(phone?: string) {
  return (phone ?? "").replace(/\D/g, "");
}

function getTossSecretKey() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    console.error("[TossPayments] Missing required environment variable: TOSS_SECRET_KEY");
    throw new Error("토스페이먼츠 Secret Key가 설정되지 않았습니다.");
  }
  return secretKey;
}

function getTossClientKey() {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || process.env.TOSS_CLIENT_KEY;
  if (!clientKey) {
    console.error("[TossPayments] Missing required environment variable: NEXT_PUBLIC_TOSS_CLIENT_KEY");
    throw new Error("토스페이먼츠 Client Key가 설정되지 않았습니다.");
  }
  return clientKey;
}

function getSuccessUrl() {
  return process.env.TOSS_SUCCESS_URL || "http://localhost:3000/payment/success";
}

function getFailUrl() {
  return process.env.TOSS_FAIL_URL || "http://localhost:3000/payment/fail";
}

function tossAuthHeader() {
  return `Basic ${Buffer.from(`${getTossSecretKey()}:`).toString("base64")}`;
}

function makeOrderId(reservationNumber: string) {
  const normalized = reservationNumber.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 42);
  return `choryang_${normalized}_${Date.now().toString(36)}`.slice(0, 64);
}

async function readReservation(reservationId: string) {
  const snapshot = await getAdminFirestore().collection(RESERVATIONS).doc(reservationId).get();
  if (!snapshot.exists) throw new Error("예약 정보를 찾을 수 없습니다.");
  return snapshot.data() as Reservation;
}

async function assertCanAccessReservation(reservation: Reservation, input: TossPrepareInput) {
  const session = await getSessionPayload();
  if (session?.userId && reservation.userId && reservation.userId === session.userId) return;
  if (input.reservationNumber?.toUpperCase() === reservation.reservationNumber && normalizePhone(input.phone) === normalizePhone(reservation.phone)) return;
  throw new Error("예약 결제 권한을 확인할 수 없습니다.");
}

function assertPayableReservation(reservation: Reservation) {
  if (reservation.status !== "payment_requested") throw new Error("관리자 결제 요청 후 결제할 수 있습니다.");
  if (reservation.paymentMethod !== "online") throw new Error("온라인결제 예약만 토스페이먼츠로 결제할 수 있습니다.");
  if (reservation.totalAmount == null || reservation.totalAmount <= 0) throw new Error("결제 금액이 확정되지 않은 예약입니다.");
}

async function requestTossPaymentWindow(input: {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
}) {
  const response = await fetch(`${TOSS_API_BASE}/v1/payments`, {
    method: "POST",
    headers: {
      Authorization: tossAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "CARD",
      amount: input.amount,
      orderId: input.orderId,
      orderName: input.orderName,
      successUrl: getSuccessUrl(),
      failUrl: getFailUrl(),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      flowMode: "DEFAULT",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as { checkout?: { url?: string }; message?: string };
  if (!response.ok) throw new Error(data.message || "토스페이먼츠 결제창 생성에 실패했습니다.");
  return data;
}

export async function prepareTossPayment(input: TossPrepareInput) {
  const reservation = await readReservation(input.reservationId);
  await assertCanAccessReservation(reservation, input);
  assertPayableReservation(reservation);

  const orderId = makeOrderId(reservation.reservationNumber);
  const amount = reservation.totalAmount as number;
  const orderName = `${reservation.productName} 체험 예약`;
  const requestedAt = new Date().toISOString();

  const tossPayment = await requestTossPaymentWindow({
    amount,
    orderId,
    orderName,
    customerName: reservation.customerName,
    customerEmail: reservation.email,
  });

  const payment: Payment = {
    id: orderId,
    reservationId: reservation.id,
    reservationNumber: reservation.reservationNumber,
    orderId,
    paymentKey: null,
    provider: "toss",
    method: "online",
    amount,
    status: "requested",
    requestedAt,
    approvedAt: null,
    paidAt: null,
    cancelledAt: null,
    transactionId: null,
    virtualAccountInfo: null,
    rawResponse: tossPayment,
  };

  await getAdminFirestore().collection(PAYMENTS).doc(orderId).set(
    {
      ...payment,
      requestedAtServer: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    clientKey: getTossClientKey(),
    orderId,
    orderName,
    amount,
    reservationId: reservation.id,
    reservationNumber: reservation.reservationNumber,
    checkoutUrl: tossPayment.checkout?.url ?? null,
  };
}

async function confirmWithToss(input: TossConfirmInput) {
  const response = await fetch(`${TOSS_API_BASE}/v1/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: tossAuthHeader(),
      "Content-Type": "application/json",
      "Idempotency-Key": input.orderId,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { message?: string };
  if (!response.ok) throw new Error(data.message || "토스페이먼츠 결제 승인에 실패했습니다.");
  return data;
}

async function retrieveTossPayment(paymentKey: string) {
  const response = await fetch(`${TOSS_API_BASE}/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: {
      Authorization: tossAuthHeader(),
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & { message?: string };
  if (!response.ok) throw new Error(data.message || "토스페이먼츠 결제 조회에 실패했습니다.");
  return data;
}

async function applySuccessfulPayment(input: TossConfirmInput, rawResponse: Record<string, unknown>) {
  const db = getAdminFirestore();
  const paymentRef = db.collection(PAYMENTS).doc(input.orderId);
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const paymentSnapshot = await transaction.get(paymentRef);
    if (!paymentSnapshot.exists) throw new Error("결제 요청 정보를 찾을 수 없습니다.");

    const payment = paymentSnapshot.data() as Payment;
    if (payment.amount !== input.amount) throw new Error("결제 금액이 예약 금액과 일치하지 않습니다.");

    const reservationRef = db.collection(RESERVATIONS).doc(payment.reservationId);
    const reservationSnapshot = await transaction.get(reservationRef);
    if (!reservationSnapshot.exists) throw new Error("예약 정보를 찾을 수 없습니다.");

    const reservation = reservationSnapshot.data() as Reservation;
    if (reservation.status !== "payment_requested" && reservation.status !== "paid" && reservation.status !== "confirmed") {
      throw new Error("현재 예약 상태에서는 결제를 승인할 수 없습니다.");
    }
    if (reservation.totalAmount !== input.amount) throw new Error("결제 금액이 예약 금액과 일치하지 않습니다.");

    const status = rawResponse.status === "DONE" ? "paid" : "requested";
    transaction.set(
      paymentRef,
      {
        paymentKey: input.paymentKey,
        status,
        approvedAt: status === "paid" ? now : null,
        paidAt: status === "paid" ? now : null,
        transactionId: input.paymentKey,
        rawResponse,
        updatedAt: now,
        updatedAtServer: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    if (status === "paid" && reservation.status !== "confirmed") {
      transaction.set(
        reservationRef,
        {
          status: "paid",
          updatedAt: now,
          paymentKey: input.paymentKey,
          updatedAtServer: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  });
}

export async function confirmTossPayment(input: TossConfirmInput) {
  const paymentSnapshot = await getAdminFirestore().collection(PAYMENTS).doc(input.orderId).get();
  if (!paymentSnapshot.exists) throw new Error("결제 요청 정보를 찾을 수 없습니다.");

  const payment = paymentSnapshot.data() as Payment;
  if (payment.amount !== input.amount) throw new Error("결제 금액이 예약 금액과 일치하지 않습니다.");
  if (payment.status === "paid" && payment.paymentKey === input.paymentKey) {
    return { payment };
  }

  const reservation = await readReservation(payment.reservationId);
  assertPayableReservation(reservation);
  if (reservation.totalAmount !== input.amount) throw new Error("결제 금액이 예약 금액과 일치하지 않습니다.");

  const rawResponse = await confirmWithToss(input);
  await applySuccessfulPayment(input, rawResponse);
  return { payment: { ...payment, paymentKey: input.paymentKey, status: rawResponse.status === "DONE" ? "paid" : "requested", rawResponse } };
}

export async function handleTossWebhook(body: TossWebhookBody) {
  const paymentKey = body.paymentKey ?? body.data?.paymentKey;
  const orderId = body.orderId ?? body.data?.orderId;
  if (!paymentKey || !orderId) return { ok: true, ignored: true };

  const rawResponse = await retrieveTossPayment(paymentKey);
  const amount = Number(rawResponse.totalAmount ?? rawResponse.balanceAmount ?? 0);
  const responseOrderId = String(rawResponse.orderId ?? orderId);
  if (responseOrderId !== orderId || amount <= 0) throw new Error("토스페이먼츠 웹훅 검증에 실패했습니다.");

  await applySuccessfulPayment({ paymentKey, orderId, amount }, rawResponse);
  return { ok: true };
}
