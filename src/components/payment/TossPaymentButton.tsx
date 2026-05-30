"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { prepareTossPayment } from "@/services/toss-payments.service";
import type { Reservation } from "@/types/reservation";

export function isTossPayableReservation(reservation: Reservation) {
  return reservation.status === "payment_requested" && reservation.paymentMethod === "online" && (reservation.totalAmount ?? 0) > 0;
}

export function TossPaymentButton({ reservation, phone }: { reservation: Reservation; phone?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isTossPayableReservation(reservation)) return null;

  async function startPayment() {
    setIsLoading(true);
    setMessage("");
    try {
      const payment = await prepareTossPayment(reservation, phone);
      if (!payment.checkoutUrl) throw new Error("결제창 URL을 받지 못했습니다.");
      window.location.href = payment.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제창을 여는 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={startPayment}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        {isLoading ? "결제창 준비 중" : "온라인결제 하기"}
      </button>
      <p className="mt-2 text-xs leading-5 text-[#687166]">카드, 토스페이, 네이버페이 등 토스페이먼츠 결제창에서 선택할 수 있습니다.</p>
      {message ? <p className="mt-2 text-sm font-semibold text-red-700">{message}</p> : null}
    </div>
  );
}
