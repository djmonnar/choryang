"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Lock, RotateCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import type { Product, ProductCategory } from "@/types/product";
import { productCategoryLabels } from "@/types/product";
import type { Schedule } from "@/types/schedule";
import { scheduleStatusLabels } from "@/types/schedule";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function dateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthString(date: Date) {
  return dateString(date).slice(0, 7);
}

function calendarDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: lastDay }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`),
  ];
}

export default function AdminSchedulesPage() {
  const router = useRouter();
  const today = useMemo(() => dateString(new Date()), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [month, setMonth] = useState(monthString(new Date()));
  const [selectedDate, setSelectedDate] = useState(today);
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [productId, setProductId] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [capacity, setCapacity] = useState(20);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const initialized = useRef(false);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const bookingProducts = useMemo(() => products.filter((product) => product.bookingEnabled && product.visible), [products]);
  const filteredSchedules = useMemo(
    () =>
      schedules.filter((schedule) => {
        const product = productById.get(schedule.productId);
        return category === "all" || product?.category === category;
      }),
    [category, productById, schedules],
  );
  const selectedSchedules = filteredSchedules.filter((schedule) => schedule.date === selectedDate);
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    filteredSchedules.forEach((schedule) => map.set(schedule.date, [...(map.get(schedule.date) ?? []), schedule]));
    return map;
  }, [filteredSchedules]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, schedulesResponse] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include" }),
        fetch("/api/admin/schedules", { credentials: "include" }),
      ]);
      if ([productsResponse.status, schedulesResponse.status].some((status) => status === 401 || status === 403)) {
        router.replace("/admin/login");
        return;
      }
      const productData = (await productsResponse.json()) as { products?: Product[]; error?: string };
      const scheduleData = (await schedulesResponse.json()) as { schedules?: Schedule[]; error?: string };
      if (!productsResponse.ok) throw new Error(productData.error || "상품 목록을 불러오지 못했습니다.");
      if (!schedulesResponse.ok) throw new Error(scheduleData.error || "일정 목록을 불러오지 못했습니다.");

      const nextProducts = productData.products ?? [];
      const nextSchedules = scheduleData.schedules ?? [];
      setProducts(nextProducts);
      setSchedules(nextSchedules);
      setProductId((current) => current || nextProducts.find((product) => product.bookingEnabled && product.visible)?.id || "");

      const firstUpcoming = nextSchedules.find((schedule) => schedule.date >= today) ?? nextSchedules[0];
      if (firstUpcoming && !initialized.current) {
        setMonth(firstUpcoming.date.slice(0, 7));
        setSelectedDate(firstUpcoming.date);
        initialized.current = true;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "일정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [router, today]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function changeMonth(offset: number) {
    const [year, monthNumber] = month.split("-").map(Number);
    const next = new Date(year, monthNumber - 1 + offset, 1);
    const nextMonth = monthString(next);
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  }

  async function createSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingId("new");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, date: selectedDate, startTime, endTime, capacity, memo }),
      });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as { schedule?: Schedule; error?: string };
      if (!response.ok || !data.schedule) throw new Error(data.error || "일정을 등록하지 못했습니다.");
      setSchedules((current) => [...current, data.schedule as Schedule].sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)));
      setMemo("");
      setNotice("새 회차를 등록했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "일정을 등록하지 못했습니다.");
    } finally {
      setSavingId("");
    }
  }

  function editSchedule(id: string, update: Partial<Schedule>) {
    setSchedules((current) => current.map((schedule) => (schedule.id === id ? { ...schedule, ...update } : schedule)));
  }

  async function saveSchedule(schedule: Schedule, update: Partial<Schedule> = {}) {
    setSavingId(schedule.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          capacity: schedule.capacity,
          memo: schedule.memo ?? "",
          ...update,
        }),
      });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as { schedule?: Schedule; error?: string };
      if (!response.ok || !data.schedule) throw new Error(data.error || "일정을 수정하지 못했습니다.");
      setSchedules((current) => current.map((item) => (item.id === schedule.id ? data.schedule as Schedule : item)));
      setNotice(update.status === "closed" ? "예약 접수를 마감했습니다." : update.status === "open" ? "예약 접수를 다시 열었습니다." : "일정을 저장했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "일정을 수정하지 못했습니다.");
      void loadData();
    } finally {
      setSavingId("");
    }
  }

  return (
    <ProtectedRoute>
      <AdminShell title="일정/회차 관리">
        <div className="mb-5 grid gap-3 rounded-lg border border-[#d8e5dd] bg-[#edf7f1] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-bold text-[#24573a]">날짜를 누르면 그날의 예약 현황이 바로 보입니다.</p>
            <p className="mt-1 text-sm text-[#53645a]">더 받을 수 없는 회차는 ‘접수 마감’, 다시 받을 때는 ‘마감 취소’를 누르세요.</p>
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value as ProductCategory | "all")} className="rounded-md border border-[#bad0c2] bg-white px-3 py-2 text-sm font-bold">
            <option value="all">전체 카테고리</option>
            {(["water_ecology", "making", "farming", "healing", "stay_info"] as ProductCategory[]).map((value) => (
              <option key={value} value={value}>{productCategoryLabels[value]}</option>
            ))}
          </select>
        </div>

        {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-md bg-[#e9f5ee] px-4 py-3 text-sm font-bold text-[#24573a]">{notice}</p> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="rounded-lg border border-[#e4d9c5] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <button type="button" aria-label="이전 달" onClick={() => changeMonth(-1)} className="rounded-md border border-[#d8cdb9] p-2"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="flex items-center gap-2 text-xl font-black"><CalendarDays className="h-5 w-5 text-[#24573a]" /> {month.replace("-", "년 ")}월</h2>
              <button type="button" aria-label="다음 달" onClick={() => changeMonth(1)} className="rounded-md border border-[#d8cdb9] p-2"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#69736c]">
              {weekDays.map((day) => <div key={day} className="py-2">{day}</div>)}
              {calendarDays(month).map((date, index) => {
                if (!date) return <div key={`empty-${index}`} />;
                const daySchedules = schedulesByDate.get(date) ?? [];
                const received = daySchedules.reduce((sum, schedule) => sum + schedule.reservedCount, 0);
                const closed = daySchedules.length > 0 && daySchedules.every((schedule) => schedule.status !== "open");
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-20 rounded-md border p-1.5 text-left ${
                      selectedDate === date ? "border-[#24573a] bg-[#edf7f1]" : "border-[#eee5d6] bg-white hover:bg-[#faf6ed]"
                    }`}
                  >
                    <span className="font-black">{Number(date.slice(-2))}</span>
                    {daySchedules.length > 0 ? (
                      <span className="mt-1 block rounded bg-[#e5f0eb] px-1 py-1 text-[10px] leading-4 text-[#24573a]">
                        회차 {daySchedules.length} · 예약 {received}
                      </span>
                    ) : null}
                    {closed ? <span className="mt-1 block text-[10px] font-black text-red-700">전체 마감</span> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#e4d9c5] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-black">{selectedDate} 예약 현황</h2>
            {loading ? <p className="mt-5 flex items-center gap-2 text-sm font-bold"><Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중</p> : null}
            {!loading && selectedSchedules.length === 0 ? <p className="mt-5 rounded-md bg-[#f8f1e3] p-4 text-sm font-semibold text-[#5d675f]">등록된 회차가 없습니다. 아래에서 새 회차를 등록하세요.</p> : null}
            <div className="mt-4 grid gap-3">
              {selectedSchedules.map((schedule) => {
                const product = productById.get(schedule.productId);
                const isRoom = product?.capacityType === "reservation";
                const unit = isRoom ? "실" : "명";
                const remaining = Math.max(schedule.capacity - schedule.reservedCount, 0);
                return (
                  <article key={schedule.id} className="rounded-md border border-[#e5dccb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{product?.name ?? "상품 확인 필요"}</p>
                        <p className="mt-1 text-sm font-bold text-[#24573a]">예약 {schedule.reservedCount}{unit} · 남음 {remaining}{unit}</p>
                      </div>
                      <span className={`rounded px-2 py-1 text-xs font-black ${schedule.status === "open" ? "bg-[#e6f4ec] text-[#24573a]" : "bg-red-50 text-red-700"}`}>
                        {scheduleStatusLabels[schedule.status]}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <label className="text-xs font-bold text-[#657068]">시작
                        <input type="time" value={schedule.startTime} onChange={(event) => editSchedule(schedule.id, { startTime: event.target.value })} className="mt-1 w-full rounded-md border border-[#d8cdb9] px-2 py-2 text-sm" />
                      </label>
                      <label className="text-xs font-bold text-[#657068]">종료
                        <input type="time" value={schedule.endTime} onChange={(event) => editSchedule(schedule.id, { endTime: event.target.value })} className="mt-1 w-full rounded-md border border-[#d8cdb9] px-2 py-2 text-sm" />
                      </label>
                      <label className="text-xs font-bold text-[#657068]">정원({unit})
                        <input type="number" min={schedule.reservedCount || 1} value={schedule.capacity} onChange={(event) => editSchedule(schedule.id, { capacity: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-[#d8cdb9] px-2 py-2 text-sm" />
                      </label>
                      <label className="text-xs font-bold text-[#657068]">메모
                        <input value={schedule.memo ?? ""} onChange={(event) => editSchedule(schedule.id, { memo: event.target.value })} className="mt-1 w-full rounded-md border border-[#d8cdb9] px-2 py-2 text-sm" />
                      </label>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" disabled={savingId === schedule.id} onClick={() => void saveSchedule(schedule)} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#b9cbbf] px-3 py-2 text-sm font-black text-[#24573a] disabled:opacity-50"><Save className="h-4 w-4" /> 수정 저장</button>
                      {schedule.status === "open" ? (
                        <button type="button" disabled={savingId === schedule.id} onClick={() => void saveSchedule(schedule, { status: "closed" })} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#8a3f36] px-3 py-2 text-sm font-black text-white disabled:opacity-50"><Lock className="h-4 w-4" /> 접수 마감</button>
                      ) : (
                        <button type="button" disabled={savingId === schedule.id} onClick={() => void saveSchedule(schedule, { status: "open" })} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#24573a] px-3 py-2 text-sm font-black text-white disabled:opacity-50"><RotateCcw className="h-4 w-4" /> 마감 취소</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <form onSubmit={createSchedule} className="mt-5 grid gap-3 rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm md:grid-cols-6">
          <div className="md:col-span-6">
            <h2 className="text-lg font-black">선택한 날짜에 새 회차 등록</h2>
            <p className="mt-1 text-sm text-[#657068]">{selectedDate}</p>
          </div>
          <select value={productId} onChange={(event) => setProductId(event.target.value)} required className="rounded-md border border-[#d6cab5] px-3 py-2 md:col-span-2">
            {bookingProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <input aria-label="시작 시간" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input aria-label="종료 시간" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} required className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input aria-label="정원" type="number" min={1} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} required className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <input aria-label="관리 메모" placeholder="메모(선택)" value={memo} onChange={(event) => setMemo(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-2" />
          <button disabled={savingId === "new" || !productId} className="rounded-md bg-[#24573a] px-4 py-3 font-black text-white disabled:opacity-50 md:col-span-6">
            {savingId === "new" ? "등록 중..." : "이 날짜에 회차 등록"}
          </button>
        </form>
      </AdminShell>
    </ProtectedRoute>
  );
}
