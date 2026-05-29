"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { seedProducts } from "@/data/seedProducts";
import { listSchedules, saveSchedule } from "@/services/schedules.service";
import { scheduleStatusLabels } from "@/types/schedule";

export default function AdminSchedulesPage() {
  const [version, setVersion] = useState(0);
  const [productId, setProductId] = useState(seedProducts[0]?.id ?? "");
  const [date, setDate] = useState("2026-06-08");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(20);
  const schedules = listSchedules();

  return (
    <ProtectedRoute>
      <AdminShell title="일정/회차 관리">
        <form
          className="grid gap-3 rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm md:grid-cols-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveSchedule({ id: `sch-${Date.now()}`, productId, date, startTime, endTime, capacity, reservedCount: 0, status: "open", memo: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            setVersion(version + 1);
          }}
        >
          <select value={productId} onChange={(event) => setProductId(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-2 md:col-span-2">{seedProducts.filter((p) => p.bookingEnabled).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input value={startTime} onChange={(event) => setStartTime(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input value={endTime} onChange={(event) => setEndTime(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input type="number" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <button className="rounded-md bg-[#24573a] px-4 py-2 font-bold text-white md:col-span-6">회차 등록</button>
        </form>
        <div className="mt-6 overflow-x-auto rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#f8f1e3]"><tr><th className="p-3">상품</th><th className="p-3">날짜</th><th className="p-3">시간</th><th className="p-3">정원</th><th className="p-3">예약</th><th className="p-3">남은 인원</th><th className="p-3">상태</th></tr></thead>
            <tbody>
              {schedules.map((schedule) => <tr key={`${schedule.id}-${version}`} className="border-t border-[#eee4d4]"><td className="p-3">{seedProducts.find((p) => p.id === schedule.productId)?.name}</td><td className="p-3">{schedule.date}</td><td className="p-3">{schedule.startTime}~{schedule.endTime}</td><td className="p-3">{schedule.capacity}</td><td className="p-3">{schedule.reservedCount}</td><td className="p-3">{schedule.capacity - schedule.reservedCount}</td><td className="p-3">{scheduleStatusLabels[schedule.status]}</td></tr>)}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
