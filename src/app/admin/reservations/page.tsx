"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listReservations } from "@/services/reservations.service";
import { paymentMethodLabels, reservationStatusLabels, type ReservationStatus } from "@/types/reservation";

export default function AdminReservationsPage() {
  const [status, setStatus] = useState<ReservationStatus | "all">("all");
  const [query, setQuery] = useState("");
  const reservations = listReservations();
  const filtered = useMemo(
    () =>
      reservations.filter((item) => {
        const matchesStatus = status === "all" || item.status === status;
        const matchesQuery = [item.customerName, item.phone, item.productName, item.reservationNumber].join(" ").includes(query);
        return matchesStatus && matchesQuery;
      }),
    [query, reservations, status],
  );

  return (
    <ProtectedRoute>
      <AdminShell title="예약 목록">
        <div className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[180px_1fr]">
            <select value={status} onChange={(event) => setStatus(event.target.value as ReservationStatus | "all")} className="rounded-md border border-[#d6cab5] px-3 py-2">
              <option value="all">전체 상태</option>
              {Object.entries(reservationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예약자명, 연락처, 체험명, 예약번호 검색" className="rounded-md border border-[#d6cab5] px-3 py-2" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f8f1e3]"><tr><th className="p-3">예약번호</th><th className="p-3">예약자</th><th className="p-3">연락처</th><th className="p-3">체험명</th><th className="p-3">예약일</th><th className="p-3">인원</th><th className="p-3">결제방식</th><th className="p-3">상태</th><th className="p-3">상세</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t border-[#eee4d4]">
                    <td className="p-3 font-bold">{item.reservationNumber}</td><td className="p-3">{item.customerName}</td><td className="p-3">{item.phone}</td><td className="p-3">{item.productName}</td><td className="p-3">{item.date} {item.startTime}</td><td className="p-3">{item.totalPeople}</td><td className="p-3">{paymentMethodLabels[item.paymentMethod]}</td><td className="p-3"><StatusBadge status={item.status} /></td><td className="p-3"><Link href={`/admin/reservations/${item.id}`} className="font-bold text-[#24573a]">보기</Link></td>
                  </tr>
                ))}
                {filtered.length === 0 ? <tr><td className="p-4 text-[#687166]" colSpan={9}>예약 내역이 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
