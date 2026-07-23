"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { formatCurrency } from "@/lib/utils/format";
import { getReservationTitle } from "@/lib/utils/reservationItems";
import { createPaymentRequest, listPayments, markPaymentPaid } from "@/services/payments.service";
import { listReservations } from "@/services/reservations.service";
import type { Payment, PaymentStatus } from "@/types/payment";
import { paymentMethodLabels, type Reservation } from "@/types/reservation";

const paymentStatusLabels: Record<PaymentStatus, string> = {
  requested: "온라인결제 대기",
  bank_waiting: "입금대기",
  paid: "결제완료",
  cancelled: "결제취소",
  refund_requested: "환불요청",
  refunded: "환불완료",
  failed: "결제실패",
};

export default function AdminPaymentsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([listReservations(), listPayments()])
      .then(([reservationItems, paymentItems]) => {
        setReservations(
          reservationItems.filter(
            (item) => item.status === "checking" && item.totalAmount != null && item.totalAmount > 0,
          ),
        );
        setPayments(paymentItems);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "결제 정보를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [version]);

  async function requestPayment(reservation: Reservation) {
    try {
      const result = await createPaymentRequest(reservation);
      setMessage(
        result.reservation.paymentMethod === "online"
          ? "고객에게 온라인결제를 요청했습니다."
          : "고객 예약조회 화면에 입금 계좌를 안내했습니다.",
      );
      setVersion((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.");
    }
  }

  async function confirmBankPayment(payment: Payment) {
    if (!window.confirm("실제 입금 내역을 확인하셨나요? 확인하면 예약이 최종 확정됩니다.")) return;
    try {
      await markPaymentPaid(payment.id);
      setMessage("입금을 확인하고 예약을 최종 확정했습니다.");
      setVersion((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "입금 확인 중 오류가 발생했습니다.");
    }
  }

  return (
    <ProtectedRoute>
      <AdminShell title="결제 관리">
        {message ? <p className="mb-4 rounded-md bg-[#eef7f5] px-4 py-3 text-sm font-semibold text-[#24573a]">{message}</p> : null}

        <section className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">결제 요청할 예약</h2>
          <p className="mt-2 text-sm leading-6 text-[#687166]">예약 가능 여부를 확인해 `관리자확인중`으로 바꾼 예약만 표시됩니다.</p>
          <div className="mt-4 grid gap-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="grid gap-3 rounded-lg border border-[#eee4d4] p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-bold">{reservation.reservationNumber} · {reservation.customerName}</p>
                  <p className="mt-1 text-sm text-[#687166]">
                    {getReservationTitle(reservation)} · {paymentMethodLabels[reservation.paymentMethod]} · {formatCurrency(reservation.totalAmount ?? 0)}
                  </p>
                </div>
                <button className="rounded-md bg-[#24573a] px-4 py-2 text-sm font-bold text-white" onClick={() => requestPayment(reservation)} type="button">
                  {reservation.paymentMethod === "online" ? "온라인결제 요청" : "입금 계좌 안내"}
                </button>
              </div>
            ))}
            {!isLoading && reservations.length === 0 ? <p className="text-sm text-[#687166]">현재 결제 요청할 예약이 없습니다.</p> : null}
            {isLoading ? <p className="text-sm text-[#687166]">예약을 불러오고 있습니다.</p> : null}
          </div>
        </section>

        <section className="mt-6 overflow-x-auto rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">결제 기록</h2>
          <table className="mt-4 w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f8f1e3]">
              <tr>
                <th className="p-3">예약번호</th>
                <th className="p-3">결제방식</th>
                <th className="p-3">금액</th>
                <th className="p-3">상태</th>
                <th className="p-3">요청일시</th>
                <th className="p-3">처리</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-[#eee4d4]">
                  <td className="p-3 font-bold">{payment.reservationNumber ?? payment.reservationId}</td>
                  <td className="p-3">{paymentMethodLabels[payment.method]}</td>
                  <td className="p-3">{formatCurrency(payment.amount)}</td>
                  <td className="p-3">{paymentStatusLabels[payment.status]}</td>
                  <td className="p-3">{payment.requestedAt.replace("T", " ").slice(0, 16)}</td>
                  <td className="p-3">
                    {payment.method === "bank_transfer" && payment.status === "bank_waiting" ? (
                      <button className="font-bold text-[#24573a]" onClick={() => confirmBankPayment(payment)} type="button">
                        입금 확인 · 예약 확정
                      </button>
                    ) : (
                      <span className="text-[#8a9089]">자동/처리완료</span>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && payments.length === 0 ? <tr><td colSpan={6} className="p-4 text-[#687166]">결제 기록이 없습니다.</td></tr> : null}
            </tbody>
          </table>
        </section>
      </AdminShell>
    </ProtectedRoute>
  );
}
