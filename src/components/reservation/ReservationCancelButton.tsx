"use client";

import { useState } from "react";
import { cancelReservation } from "@/services/reservations.service";
import type { Reservation, ReservationStatus } from "@/types/reservation";

const directCancelStatuses: ReservationStatus[] = ["submitted", "checking", "payment_requested", "bank_waiting"];
const refundRequestStatuses: ReservationStatus[] = ["paid", "confirmed"];

export function canRequestReservationCancel(status: ReservationStatus) {
  return directCancelStatuses.includes(status) || refundRequestStatuses.includes(status);
}

export function ReservationCancelButton({
  reservation,
  phone,
  onCancelled,
}: {
  reservation: Reservation;
  phone?: string;
  onCancelled: (reservation: Reservation) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!canRequestReservationCancel(reservation.status)) return null;

  const isRefundRequest = refundRequestStatuses.includes(reservation.status);
  const buttonLabel = isRefundRequest ? "환불 요청" : "예약 취소 요청";

  async function requestCancel() {
    const confirmMessage = isRefundRequest
      ? "예약을 취소하시겠습니까?\n결제/확정된 예약은 환불 요청으로 접수됩니다."
      : "예약을 취소하시겠습니까?\n취소 후 같은 회차 예약 가능 인원이 복구됩니다.";

    if (!window.confirm(confirmMessage)) return;

    const cancelReason = window.prompt("취소 사유를 입력해 주세요. (선택)")?.trim() || "";

    setIsLoading(true);
    setMessage("");
    try {
      const updated = await cancelReservation({
        reservationId: reservation.id,
        reservationNumber: reservation.reservationNumber,
        phone,
        cancelReason,
      });
      onCancelled(updated);
      setMessage(isRefundRequest ? "환불 요청으로 접수되었습니다. 관리자 확인 후 안내드립니다." : "예약이 취소되었습니다. 회차 정원이 복구되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "예약 취소 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={requestCancel}
        disabled={isLoading}
        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
      >
        {isLoading ? "처리 중" : buttonLabel}
      </button>
      <p className="mt-2 text-xs leading-5 text-[#687166]">
        {isRefundRequest ? "결제/확정된 예약은 관리자 확인 후 환불 처리됩니다." : "취소되면 같은 회차 예약 가능 인원이 복구됩니다."}
      </p>
      {message ? <p className="mt-2 text-sm font-semibold text-[#24573a]">{message}</p> : null}
    </div>
  );
}
