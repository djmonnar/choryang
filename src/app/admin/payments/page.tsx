"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { createPaymentRequest, listPayments, markPaymentPaid } from "@/services/payments.service";
import { listReservations } from "@/services/reservations.service";
import { formatCurrency } from "@/lib/utils/format";

export default function AdminPaymentsPage() {
  const [version, setVersion] = useState(0);
  const reservations = listReservations().filter((item) => item.totalAmount !== null);
  const payments = listPayments();

  return (
    <ProtectedRoute>
      <AdminShell title="결제 관리">
        <div className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">결제요청 처리</h2>
          <div className="mt-4 grid gap-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="grid gap-3 rounded-lg border border-[#eee4d4] p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-bold">{reservation.reservationNumber} · {reservation.customerName}</p>
                  <p className="text-sm text-[#687166]">{reservation.productName} / {reservation.totalAmount == null ? "문의 후 안내" : formatCurrency(reservation.totalAmount)}</p>
                </div>
                <button className="rounded-md bg-[#24573a] px-4 py-2 text-sm font-bold text-white" onClick={async () => { await createPaymentRequest(reservation); setVersion(version + 1); }} type="button">결제요청</button>
              </div>
            ))}
            {reservations.length === 0 ? <p className="text-sm text-[#687166]">결제 요청 가능한 예약이 없습니다.</p> : null}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">결제 기록</h2>
          <table className="mt-4 w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f8f1e3]"><tr><th className="p-3">결제ID</th><th className="p-3">예약ID</th><th className="p-3">Provider</th><th className="p-3">금액</th><th className="p-3">상태</th><th className="p-3">처리</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={`${payment.id}-${version}`} className="border-t border-[#eee4d4]"><td className="p-3">{payment.id}</td><td className="p-3">{payment.reservationId}</td><td className="p-3">{payment.provider}</td><td className="p-3">{formatCurrency(payment.amount)}</td><td className="p-3">{payment.status}</td><td className="p-3"><button className="font-bold text-[#24573a]" onClick={() => { markPaymentPaid(payment.id); setVersion(version + 1); }} type="button">결제완료</button></td></tr>
              ))}
              {payments.length === 0 ? <tr><td colSpan={6} className="p-4 text-[#687166]">결제 기록이 없습니다.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
