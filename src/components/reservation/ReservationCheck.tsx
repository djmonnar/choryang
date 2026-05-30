"use client";

import { useState } from "react";
import { TossPaymentButton } from "@/components/payment/TossPaymentButton";
import { findReservation } from "@/services/reservations.service";
import type { Reservation } from "@/types/reservation";
import { paymentMethodLabels, reservationStatusLabels } from "@/types/reservation";

export function ReservationCheck() {
  const [reservationNumber, setReservationNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Reservation | null>(null);
  const [message, setMessage] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <form
        className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            const found = await findReservation(reservationNumber, phone);
            setResult(found);
            setMessage(found ? "" : "일치하는 예약을 찾지 못했습니다. 예약번호와 연락처를 확인해 주세요.");
          } catch {
            setResult(null);
            setMessage("예약 조회 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
          }
        }}
      >
        <label className="block text-sm font-bold">예약번호</label>
        <input value={reservationNumber} onChange={(event) => setReservationNumber(event.target.value)} placeholder="CR-20260606-ABCD" className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
        <label className="mt-4 block text-sm font-bold">연락처</label>
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="010-1234-5678" className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
        <button className="mt-5 w-full rounded-md bg-[#24573a] px-4 py-3 font-bold text-white">예약 조회</button>
        {message ? <p className="mt-4 text-sm font-semibold text-red-700">{message}</p> : null}
      </form>
      <div className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        {result ? (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-[#6b715f]">예약번호</dt><dd className="font-bold">{result.reservationNumber}</dd></div>
              <div><dt className="text-[#6b715f]">상태</dt><dd className="font-bold text-[#24573a]">{reservationStatusLabels[result.status]}</dd></div>
              <div><dt className="text-[#6b715f]">체험</dt><dd className="font-bold">{result.productName}</dd></div>
              <div><dt className="text-[#6b715f]">일시</dt><dd className="font-bold">{result.date} {result.startTime}</dd></div>
              <div><dt className="text-[#6b715f]">인원</dt><dd className="font-bold">{result.totalPeople}명</dd></div>
              <div><dt className="text-[#6b715f]">결제방식</dt><dd className="font-bold">{paymentMethodLabels[result.paymentMethod]}</dd></div>
            </dl>
            <TossPaymentButton reservation={result} phone={phone} />
          </>
        ) : (
          <p className="leading-7 text-[#5d665e]">예약 신청 후 발급된 예약번호와 연락처로 접수 상태를 확인할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
