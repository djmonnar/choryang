"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createPaymentRequest } from "@/services/payments.service";
import { getReservation, updateReservationStatus } from "@/services/reservations.service";
import { formatCurrency } from "@/lib/utils/format";
import { paymentMethodLabels, reservationStatusLabels, type ReservationStatus } from "@/types/reservation";

const statusButtons: ReservationStatus[] = ["checking", "payment_requested", "bank_waiting", "paid", "confirmed", "completed", "cancelled", "refund_requested", "refunded"];

export default function AdminReservationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");
  const reservation = getReservation(params.id);

  if (!reservation) {
    return (
      <ProtectedRoute><AdminShell title="예약 상세"><p>예약을 찾을 수 없습니다.</p></AdminShell></ProtectedRoute>
    );
  }

  async function requestPayment() {
    const payment = await createPaymentRequest(reservation!);
    setMessage(`결제 요청이 생성되었습니다: ${payment.id}`);
    router.refresh();
  }

  return (
    <ProtectedRoute>
      <AdminShell title="예약 상세">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{reservation.reservationNumber}</h2>
              <StatusBadge status={reservation.status} />
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-[#6b715f]">예약자</dt><dd className="font-bold">{reservation.customerName}</dd></div>
              <div><dt className="text-[#6b715f]">연락처</dt><dd className="font-bold">{reservation.phone}</dd></div>
              <div><dt className="text-[#6b715f]">이메일</dt><dd className="font-bold">{reservation.email || "-"}</dd></div>
              <div><dt className="text-[#6b715f]">체험</dt><dd className="font-bold">{reservation.productName}</dd></div>
              <div><dt className="text-[#6b715f]">일시</dt><dd className="font-bold">{reservation.date} {reservation.startTime}</dd></div>
              <div><dt className="text-[#6b715f]">인원</dt><dd className="font-bold">성인 {reservation.adultCount}, 중고등 {reservation.youthCount}, 유초등 {reservation.childCount}</dd></div>
              <div><dt className="text-[#6b715f]">결제방식</dt><dd className="font-bold">{paymentMethodLabels[reservation.paymentMethod]}</dd></div>
              <div><dt className="text-[#6b715f]">금액</dt><dd className="font-bold text-[#24573a]">{reservation.totalAmount == null ? "문의 후 안내" : formatCurrency(reservation.totalAmount)}</dd></div>
            </dl>
            <div className="mt-6 rounded-lg bg-[#f8f1e3] p-4">
              <p className="font-bold">요청사항</p>
              <p className="mt-2 text-sm leading-6 text-[#5d665e]">{reservation.requestMemo || "없음"}</p>
            </div>
          </section>
          <aside className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
            <h2 className="font-bold">상태 변경</h2>
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="관리자 메모" className="mt-3 min-h-24 w-full rounded-md border border-[#d6cab5] px-3 py-2" />
            <div className="mt-3 grid gap-2">
              {statusButtons.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    updateReservationStatus(reservation.id, status, memo);
                    router.refresh();
                    setMessage(`${reservationStatusLabels[status]} 상태로 변경했습니다.`);
                  }}
                  className="rounded-md border border-[#d7ccb7] px-3 py-2 text-sm font-bold hover:bg-[#f8f1e3]"
                >
                  {reservationStatusLabels[status]}
                </button>
              ))}
              <button type="button" onClick={requestPayment} className="rounded-md bg-[#24573a] px-3 py-2 text-sm font-bold text-white">결제요청 생성</button>
            </div>
            {message ? <p className="mt-3 text-sm font-semibold text-[#24573a]">{message}</p> : null}
          </aside>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
