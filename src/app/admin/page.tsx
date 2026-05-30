"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listReservations } from "@/services/reservations.service";
import type { Reservation } from "@/types/reservation";

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    listReservations()
      .then(setReservations)
      .catch(() => setMessage("예약 목록을 불러오지 못했습니다."));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = useMemo(() => {
    const date = new Date(`${today}T00:00:00+09:00`);
    date.setDate(date.getDate() + 7);
    return date.toISOString().slice(0, 10);
  }, [today]);
  const weekCount = reservations.filter((item) => item.date >= today && item.date <= weekEnd).length;
  const paymentWaiting = reservations.filter((item) => ["payment_requested", "bank_waiting"].includes(item.status)).length;
  const confirmed = reservations.filter((item) => item.status === "confirmed").length;

  return (
    <ProtectedRoute>
      <AdminShell title="대시보드">
        {message ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p> : null}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["오늘 예약", reservations.filter((item) => item.date === today).length],
            ["이번 주 예약", weekCount],
            ["결제대기", paymentWaiting],
            ["확정예약", confirmed],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#687166]">{label}</p>
              <p className="mt-2 text-3xl font-black text-[#24573a]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">최근 예약</h2>
            <Link href="/admin/reservations" className="text-sm font-bold text-[#24573a]">전체 보기</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f8f1e3]"><tr><th className="p-3">예약자</th><th className="p-3">체험</th><th className="p-3">일시</th><th className="p-3">인원</th><th className="p-3">상태</th></tr></thead>
              <tbody>
                {reservations.slice(0, 6).map((item) => (
                  <tr key={item.id} className="border-t border-[#eee4d4]"><td className="p-3">{item.customerName}</td><td className="p-3">{item.productName}</td><td className="p-3">{item.date} {item.startTime}</td><td className="p-3">{item.totalPeople}</td><td className="p-3"><StatusBadge status={item.status} /></td></tr>
                ))}
                {reservations.length === 0 ? <tr><td className="p-4 text-[#687166]" colSpan={5}>아직 접수된 예약이 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
