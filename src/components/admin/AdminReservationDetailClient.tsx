"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createPaymentRequest, markPaymentPaid } from "@/services/payments.service";
import { getReservation, updateReservationStatus } from "@/services/reservations.service";
import { formatCurrency } from "@/lib/utils/format";
import { formatReservationItemTime, getReservationItems, getReservationTitle } from "@/lib/utils/reservationItems";
import { paymentMethodLabels, reservationStatusLabels, type Reservation, type ReservationStatus } from "@/types/reservation";

const statusButtons: ReservationStatus[] = [
  "checking",
  "payment_requested",
  "bank_waiting",
  "paid",
  "confirmed",
  "completed",
  "cancelled",
  "refund_requested",
  "refunded",
];

export function AdminReservationDetailClient() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reservationId = params.id ?? searchParams.get("id") ?? "";

  useEffect(() => {
    getReservation(reservationId)
      .then(setReservation)
      .catch(() => setMessage("예약 상세를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [reservationId]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminShell title="예약 상세">
          <p>예약 정보를 불러오고 있습니다.</p>
        </AdminShell>
      </ProtectedRoute>
    );
  }

  if (!reservation) {
    return (
      <ProtectedRoute>
        <AdminShell title="예약 상세">
          <p>예약을 찾을 수 없습니다.</p>
        </AdminShell>
      </ProtectedRoute>
    );
  }

  async function requestPayment() {
    try {
      const result = await createPaymentRequest(reservation!);
      setReservation(result.reservation);
      setMessage(
        result.reservation.paymentMethod === "online"
          ? "온라인결제를 요청했습니다. 고객이 결제하면 예약이 자동 확정됩니다."
          : "입금 계좌를 안내했습니다. 입금 확인 후 아래 버튼을 눌러 주세요.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.");
    }
  }

  async function changeStatus(status: ReservationStatus) {
    if (status === "cancelled" && !window.confirm("예약취소로 변경하시겠습니까? 정원이 복구되지 않은 예약이면 회차 정원이 복구됩니다.")) return;
    try {
      const updated = await updateReservationStatus(reservation!.id, status, memo);
      setReservation(updated);
      setMessage(
        status === "cancelled"
          ? `${reservationStatusLabels[status]} 상태로 변경했습니다. 정원 복구 여부: ${updated.capacityRestored ? "복구됨" : "미복구"}`
          : `${reservationStatusLabels[status]} 상태로 변경했습니다.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "상태 변경 중 오류가 발생했습니다.");
    }
  }

  async function confirmBankPayment() {
    if (!reservation?.paymentRequestId) {
      setMessage("결제 요청 기록을 찾을 수 없습니다. 결제 관리 화면에서 확인해 주세요.");
      return;
    }
    if (!window.confirm("실제 입금 내역을 확인하셨나요? 확인하면 예약이 최종 확정됩니다.")) return;

    try {
      const result = await markPaymentPaid(reservation.paymentRequestId);
      setReservation(result.reservation);
      setMessage("입금을 확인하고 예약을 최종 확정했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "입금 확인 중 오류가 발생했습니다.");
    }
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
              <div>
                <dt className="text-[#6b715f]">예약자</dt>
                <dd className="font-bold">{reservation.customerName}</dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">연락처</dt>
                <dd className="font-bold">{reservation.phone}</dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">이메일</dt>
                <dd className="font-bold">{reservation.email || "-"}</dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">체험</dt>
                <dd className="font-bold">{getReservationTitle(reservation)}</dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">방문일</dt>
                <dd className="font-bold">
                  {reservation.visitDate ?? reservation.date}
                </dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">인원</dt>
                <dd className="font-bold">
                  성인 {reservation.adultCount}, 청소년 {reservation.youthCount + reservation.childCount}, 유치원 {reservation.preschoolCount ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">결제방식</dt>
                <dd className="font-bold">{paymentMethodLabels[reservation.paymentMethod]}</dd>
              </div>
              <div>
                <dt className="text-[#6b715f]">금액</dt>
                <dd className="font-bold text-[#24573a]">
                  {reservation.totalAmount == null ? "문의 후 안내" : formatCurrency(reservation.totalAmount)}
                </dd>
              </div>
            </dl>
            <div className="mt-6 rounded-lg bg-[#f8f1e3] p-4">
              <p className="font-bold">신청 체험</p>
              <div className="mt-3 grid gap-2">
                {getReservationItems(reservation).map((item) => (
                  <div key={`${item.scheduleId}-${item.startTime}`} className="rounded-md bg-white p-3 text-sm">
                    <p className="font-bold">{item.productName}</p>
                    <p className="mt-1 text-[#5d665e]">
                      {formatReservationItemTime(item)} · 성인 {item.adultCount}, 청소년 {item.youthCount + item.childCount}, 유치원 {item.preschoolCount ?? 0} ·{" "}
                      {item.amount == null ? "문의 후 안내" : formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-[#f8f1e3] p-4">
              <p className="font-bold">입금/환불 정보</p>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[#6b715f]">입금자명</dt>
                  <dd className="font-bold">{reservation.depositorName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">환불은행</dt>
                  <dd className="font-bold">{reservation.refundBankName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">환불계좌</dt>
                  <dd className="font-bold">{reservation.refundAccountNumber || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">환불 예금주</dt>
                  <dd className="font-bold">{reservation.refundAccountHolder || "-"}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 rounded-lg bg-[#f8f1e3] p-4">
              <p className="font-bold">요청사항</p>
              <p className="mt-2 text-sm leading-6 text-[#5d665e]">{reservation.requestMemo || "없음"}</p>
            </div>
            <div className={`mt-4 rounded-lg p-4 ${reservation.status === "refund_requested" ? "bg-purple-50 ring-1 ring-purple-200" : "bg-[#f8f1e3]"}`}>
              <p className="font-bold">취소/환불 정보</p>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[#6b715f]">취소 사유</dt>
                  <dd className="font-bold">{reservation.cancelReason || "없음"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">취소/요청자</dt>
                  <dd className="font-bold">{reservation.cancelledBy === "customer" ? "고객" : reservation.cancelledBy === "admin" ? "관리자" : "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">취소 일시</dt>
                  <dd className="font-bold">{reservation.cancelledAt || "-"}</dd>
                </div>
                <div>
                  <dt className="text-[#6b715f]">정원 복구</dt>
                  <dd className="font-bold">{reservation.capacityRestored ? "복구됨" : "미복구"}</dd>
                </div>
              </dl>
              {reservation.status === "refund_requested" ? (
                <p className="mt-3 text-sm font-semibold text-purple-800">환불 요청 상태입니다. 결제/확정된 예약은 관리자 확인 후 환불 처리해 주세요.</p>
              ) : null}
            </div>
          </section>
          <aside className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
            <h2 className="font-bold">다음 처리</h2>
            <p className="mt-2 text-sm leading-6 text-[#687166]">현재 상태에 맞는 큰 버튼을 순서대로 눌러 주세요.</p>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="관리자 메모"
              className="mt-3 min-h-24 w-full rounded-md border border-[#d6cab5] px-3 py-2"
            />
            <div className="mt-3 grid gap-2">
              {reservation.status === "submitted" ? (
                <button
                  type="button"
                  onClick={() => changeStatus("checking")}
                  className="rounded-md bg-[#24573a] px-3 py-3 text-sm font-bold text-white"
                >
                  1. 예약 가능 여부 확인 시작
                </button>
              ) : null}
              {reservation.status === "checking" ? (
                <button type="button" onClick={requestPayment} className="rounded-md bg-[#24573a] px-3 py-3 text-sm font-bold text-white">
                  2. {reservation.paymentMethod === "online" ? "온라인결제 요청" : "입금 계좌 안내"}
                </button>
              ) : null}
              {reservation.status === "payment_requested" ? (
                <p className="rounded-md bg-[#eef7f5] px-3 py-3 text-sm font-semibold leading-6 text-[#315e61]">고객의 온라인결제를 기다리고 있습니다. 결제가 끝나면 자동으로 예약확정됩니다.</p>
              ) : null}
              {reservation.status === "bank_waiting" ? (
                <button type="button" onClick={confirmBankPayment} className="rounded-md bg-[#24573a] px-3 py-3 text-sm font-bold text-white">
                  3. 입금 확인 · 예약 확정
                </button>
              ) : null}
              {reservation.status === "paid" ? (
                <button type="button" onClick={() => changeStatus("confirmed")} className="rounded-md bg-[#24573a] px-3 py-3 text-sm font-bold text-white">
                  3. 예약 최종 확정
                </button>
              ) : null}
              {reservation.status === "confirmed" ? (
                <button type="button" onClick={() => changeStatus("completed")} className="rounded-md bg-[#24573a] px-3 py-3 text-sm font-bold text-white">
                  체험 완료 처리
                </button>
              ) : null}
              {reservation.status === "refund_requested" ? (
                <button type="button" onClick={() => changeStatus("refunded")} className="rounded-md bg-purple-700 px-3 py-3 text-sm font-bold text-white">
                  환불 완료 처리
                </button>
              ) : null}
            </div>
            <details className="mt-4 border-t border-[#e6dcc9] pt-4">
              <summary className="cursor-pointer text-sm font-bold text-[#5d665e]">상태 직접 수정</summary>
              <div className="mt-3 grid gap-2">
                {statusButtons.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => changeStatus(status)}
                    className="rounded-md border border-[#d7ccb7] px-3 py-2 text-sm font-bold hover:bg-[#f8f1e3]"
                  >
                    {reservationStatusLabels[status]}
                  </button>
                ))}
              </div>
            </details>
            {message ? <p className="mt-3 text-sm font-semibold text-[#24573a]">{message}</p> : null}
          </aside>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
