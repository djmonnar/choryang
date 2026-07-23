"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { reservationCautions, siteSettings } from "@/data/siteSettings";
import {
  calculateAmount,
  formatCurrency,
  getReservationCapacityUnits,
  isProductAvailableOnDate,
} from "@/lib/utils/format";
import { listPublicProducts, listPublicSchedules } from "@/services/catalog.service";
import { createReservation } from "@/services/reservations.service";
import type { Product } from "@/types/product";
import type { PaymentMethod, ReservationItemInput } from "@/types/reservation";
import type { Schedule } from "@/types/schedule";
import { scheduleStatusLabels } from "@/types/schedule";
import type { PublicUser } from "@/types/user";

const steps = ["방문 날짜", "인원 입력", "체험 선택", "예약자 정보", "결제/환불 정보", "신청 완료"];

function remainingSeats(schedule: Schedule) {
  return Math.max(schedule.capacity - schedule.reservedCount, 0);
}

function timeKey(schedule: Schedule) {
  return `${schedule.date}-${schedule.startTime}-${schedule.endTime}`;
}

function timeText(schedule: Schedule, product?: Product) {
  if (product?.capacityType === "reservation") {
    return `체크인 ${schedule.startTime} · 체크아웃 익일 ${schedule.endTime}`;
  }
  return `${schedule.startTime}~${schedule.endTime}`;
}

function countPeople(counts: { adultCount: number; youthCount: number; preschoolCount: number }) {
  return counts.adultCount + counts.youthCount + counts.preschoolCount;
}

export function ReservationWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedProductId = searchParams.get("productId") ?? "";

  const [step, setStep] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [visitDate, setVisitDate] = useState("");
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [youthCount, setYouthCount] = useState(0);
  const [preschoolCount, setPreschoolCount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [cautionAgreed, setCautionAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [depositorName, setDepositorName] = useState("");
  const [refundBankName, setRefundBankName] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundAccountHolder, setRefundAccountHolder] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const scheduleById = useMemo(() => new Map(schedules.map((schedule) => [schedule.id, schedule])), [schedules]);
  const totalPeople = countPeople({ adultCount, youthCount, preschoolCount });
  const visibleSchedules = useMemo(
    () =>
      schedules.filter((schedule) => {
        const product = productById.get(schedule.productId);
        return product?.bookingEnabled && isProductAvailableOnDate(product, schedule.date);
      }),
    [productById, schedules],
  );
  const dateOptions = useMemo(() => [...new Set(visibleSchedules.map((schedule) => schedule.date))].sort(), [visibleSchedules]);
  const schedulesForDate = visibleSchedules.filter((schedule) => schedule.date === visitDate);
  const selectedSchedules = selectedScheduleIds.map((id) => scheduleById.get(id)).filter(Boolean) as Schedule[];
  const selectedTimeKeys = new Set(selectedSchedules.map(timeKey));

  const selectedItems = selectedSchedules.map((schedule) => {
    const product = productById.get(schedule.productId);
    const counts = { adultCount, youthCount, childCount: 0, preschoolCount };
    return {
      schedule,
      product,
      amount: product ? calculateAmount(product, counts, schedule.date) : null,
    };
  });
  const totalAmount = selectedItems.some((item) => item.amount == null) ? null : selectedItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);

  useEffect(() => {
    let isMounted = true;
    setProductsLoading(true);
    setSchedulesLoading(true);
    setLoadError("");

    Promise.all([listPublicProducts(), listPublicSchedules()])
      .then(([productData, scheduleData]) => {
        if (!isMounted) return;
        setProducts(productData);
        setSchedules(scheduleData);
        const firstRequestedSchedule = requestedProductId ? scheduleData.find((schedule) => schedule.productId === requestedProductId && schedule.status === "open") : undefined;
        const firstDate = firstRequestedSchedule?.date ?? scheduleData.find((schedule) => schedule.status === "open")?.date ?? scheduleData[0]?.date ?? "";
        setVisitDate(firstDate);
        if (firstRequestedSchedule) setSelectedScheduleIds([firstRequestedSchedule.id]);
      })
      .catch((caught) => {
        if (!isMounted) return;
        setLoadError(caught instanceof Error ? caught.message : "예약 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!isMounted) return;
        setProductsLoading(false);
        setSchedulesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestedProductId]);

  useEffect(() => {
    setSelectedScheduleIds((ids) => ids.filter((id) => scheduleById.get(id)?.date === visitDate));
  }, [scheduleById, visitDate]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.json() as Promise<{ user: PublicUser | null }>)
      .then((data) => {
        if (!isMounted || !data.user) return;
        setCurrentUser(data.user);
        setCustomerName((value) => value || data.user?.name || data.user?.nickname || "");
        setPhone((value) => value || data.user?.mobile || "");
        setEmail((value) => value || data.user?.email || "");
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function isScheduleSelectable(schedule: Schedule) {
    const product = productById.get(schedule.productId);
    if (!product) return false;
    if (schedule.status !== "open") return false;
    if (!isProductAvailableOnDate(product, schedule.date)) return false;
    if (preschoolCount > 0 && product.preschoolAllowed === false) return false;
    if (remainingSeats(schedule) < getReservationCapacityUnits(product, totalPeople)) return false;
    if (selectedScheduleIds.includes(schedule.id)) return true;
    if (selectedTimeKeys.has(timeKey(schedule))) return false;
    return true;
  }

  function toggleSchedule(schedule: Schedule) {
    if (!isScheduleSelectable(schedule)) {
      const product = productById.get(schedule.productId);
      const message =
        preschoolCount > 0 && product?.preschoolAllowed === false
          ? `${product.name}은 유치원생이 참여할 수 없습니다.`
          : selectedTimeKeys.has(timeKey(schedule))
            ? "같은 시간대 체험은 중복 선택할 수 없습니다."
            : "정원이 부족하거나 마감된 회차입니다.";
      setError(message);
      return;
    }
    setError("");
    setSelectedScheduleIds((ids) => (ids.includes(schedule.id) ? ids.filter((id) => id !== schedule.id) : [...ids, schedule.id]));
  }

  function validateCurrentStep() {
    if (loadError) return loadError;
    if (productsLoading || schedulesLoading) return "예약 정보를 불러오는 중입니다. 잠시만 기다려 주세요.";
    if (step === 0 && !visitDate) return "방문 날짜를 선택해 주세요.";
    if (step === 1 && totalPeople <= 0) return "인원은 1명 이상이어야 합니다.";
    if (step === 2) {
      if (selectedScheduleIds.length === 0) return "최소 1개 이상의 체험 회차를 선택해 주세요.";
      const restricted = selectedSchedules.find((schedule) => {
        const product = productById.get(schedule.productId);
        return preschoolCount > 0 && product?.preschoolAllowed === false;
      });
      if (restricted) return `${productById.get(restricted.productId)?.name ?? "선택한 프로그램"}은 유치원생이 참여할 수 없습니다.`;
      const invalid = selectedSchedules.find((schedule) => {
        const product = productById.get(schedule.productId);
        return !product || schedule.status !== "open" || remainingSeats(schedule) < getReservationCapacityUnits(product, totalPeople);
      });
      if (invalid) return "선택한 체험 중 정원이 부족하거나 마감된 회차가 있습니다.";
      if (new Set(selectedSchedules.map(timeKey)).size !== selectedSchedules.length) return "같은 시간대 체험은 중복 선택할 수 없습니다.";
    }
    if (step === 3) {
      if (!customerName.trim()) return "예약자 이름을 입력해 주세요.";
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim())) return "연락처 형식을 확인해 주세요.";
      if (!privacyAgreed) return "개인정보 수집 동의가 필요합니다.";
      if (!cautionAgreed) return "예약 유의사항 동의가 필요합니다.";
    }
    if (step === 4 && paymentMethod === "bank_transfer") {
      if (!depositorName.trim()) return "입금자명을 입력해 주세요.";
      if (!refundBankName.trim() || !refundAccountNumber.trim() || !refundAccountHolder.trim()) return "환불 계좌 정보를 입력해 주세요.";
    }
    return "";
  }

  function next() {
    const message = validateCurrentStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function submit() {
    const message = validateCurrentStep();
    if (message) {
      setError(message);
      return;
    }

    const items: ReservationItemInput[] = selectedItems.map(({ schedule }) => ({
      productId: schedule.productId,
      scheduleId: schedule.id,
      adultCount,
      youthCount,
      childCount: 0,
      preschoolCount,
    }));

    try {
      const reservation = await createReservation({
        items,
        customerName,
        phone,
        email: email || undefined,
        paymentMethod,
        depositorName: paymentMethod === "bank_transfer" ? depositorName : undefined,
        refundBankName: paymentMethod === "bank_transfer" ? refundBankName : undefined,
        refundAccountNumber: paymentMethod === "bank_transfer" ? refundAccountNumber : undefined,
        refundAccountHolder: paymentMethod === "bank_transfer" ? refundAccountHolder : undefined,
        requestMemo,
        adminMemo: "",
        privacyAgreed,
        cautionAgreed,
      });
      router.push(`/reservation/complete?reservationNumber=${reservation.reservationNumber}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "예약 처리 중 오류가 발생했습니다. 관리자에게 문의해 주세요.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_0.25fr]">
      <section className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm md:p-7">
        <ol className="grid grid-cols-2 gap-2 text-xs font-bold text-[#6a715f] md:grid-cols-6">
          {steps.map((label, index) => (
            <li key={label} className={`rounded-md px-3 py-2 text-center ${index === step ? "bg-[#24573a] text-white" : "bg-[#f5eedf]"}`}>
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        {loadError ? <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</p> : null}

        <div className="mt-8 min-h-[420px]">
          {step === 0 ? (
            <div>
              <h2 className="text-xl font-bold">방문 날짜 선택</h2>
              {schedulesLoading ? <p className="mt-4 rounded-lg bg-[#f8f1e3] p-4 text-sm font-semibold text-[#5f675a]">체험 일정을 불러오는 중입니다.</p> : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dateOptions.map((date) => {
                  const availableCount = visibleSchedules.filter((schedule) => schedule.date === date && schedule.status === "open").length;
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setVisitDate(date)}
                      className={`rounded-lg border p-4 text-left ${visitDate === date ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6] bg-white"}`}
                    >
                      <span className="font-bold">{date}</span>
                      <span className="block text-sm text-[#617064]">예약 가능 회차 {availableCount}개</span>
                    </button>
                  );
                })}
              </div>
              {!schedulesLoading && dateOptions.length === 0 ? <p className="mt-4 rounded-lg bg-[#f8f1e3] p-4 text-sm font-semibold text-[#5f675a]">등록된 예약 가능 일정이 없습니다.</p> : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">인원 입력</h2>
              {[
                ["성인", adultCount, setAdultCount],
                ["청소년", youthCount, setYouthCount],
                ["유치원생", preschoolCount, setPreschoolCount],
              ].map(([label, value, setter]) => (
                <label key={label as string} className="grid gap-2 rounded-lg border border-[#e2d8c6] p-4 sm:grid-cols-[1fr_180px] sm:items-center">
                  <span className="font-bold">{label as string}</span>
                  <input
                    type="number"
                    min={0}
                    value={value as number}
                    onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))}
                    className="rounded-md border border-[#d6cab5] px-3 py-2"
                  />
                </label>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-xl font-bold">체험 회차 선택</h2>
              <p className="mt-2 text-sm text-[#617064]">같은 시간대 체험은 중복 선택할 수 없습니다. 잔여석이 부족한 회차는 선택할 수 없습니다.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {schedulesForDate.map((schedule) => {
                  const product = productById.get(schedule.productId);
                  const selected = selectedScheduleIds.includes(schedule.id);
                  const selectable = isScheduleSelectable(schedule);
                  const amount = product ? calculateAmount(product, { adultCount, youthCount, childCount: 0, preschoolCount }, schedule.date) : null;
                  const isRoom = product?.capacityType === "reservation";
                  const preschoolRestricted = preschoolCount > 0 && product?.preschoolAllowed === false;
                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      disabled={!selectable && !selected}
                      onClick={() => toggleSchedule(schedule)}
                      className={`rounded-lg border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                        selected ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6] bg-white"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-bold">{product?.name ?? "체험"}</span>
                          <span className="mt-1 block text-sm text-[#617064]">{timeText(schedule, product)}</span>
                        </span>
                        <span className={`rounded px-2 py-1 text-xs font-bold ${selected ? "bg-[#24573a] text-white" : "bg-[#f4eee0] text-[#6c4f35]"}`}>
                          {selected ? "선택됨" : scheduleStatusLabels[schedule.status]}
                        </span>
                      </span>
                      <span className="mt-3 block text-sm text-[#617064]">
                        {isRoom
                          ? `객실 ${schedule.capacity}실 / 예약 ${schedule.reservedCount}실 / 남은 객실 ${remainingSeats(schedule)}실`
                          : `정원 ${schedule.capacity}명 / 예약 ${schedule.reservedCount}명 / 잔여 ${remainingSeats(schedule)}명`}
                      </span>
                      {preschoolRestricted ? <span className="mt-2 block text-xs font-bold text-red-700">유치원생 참여 불가</span> : null}
                      <span className="mt-2 block text-sm font-semibold text-[#24573a]">{amount == null ? "문의 후 안내" : formatCurrency(amount)}</span>
                    </button>
                  );
                })}
              </div>
              {schedulesForDate.length === 0 ? <p className="mt-4 rounded-lg bg-[#f8f1e3] p-4 text-sm font-semibold text-[#5f675a]">선택한 날짜에 표시할 체험 회차가 없습니다.</p> : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-bold">예약자 정보 입력</h2>
              {currentUser ? (
                <p className="rounded-md bg-[#edf7f1] px-4 py-3 text-sm font-semibold text-[#24573a]">
                  네이버 로그인 정보로 예약자 정보를 자동 입력했습니다. 필요한 경우 수정할 수 있습니다.
                </p>
              ) : null}
              <input placeholder="예약자 이름" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
              <input placeholder="연락처 예: 010-1234-5678" value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
              <input placeholder="이메일 선택 입력" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
              <textarea placeholder="요청사항" value={requestMemo} onChange={(event) => setRequestMemo(event.target.value)} className="min-h-28 rounded-md border border-[#d6cab5] px-3 py-3" />
              <label className="flex gap-3 rounded-lg bg-[#f8f1e3] p-4 text-sm leading-6">
                <input type="checkbox" checked={privacyAgreed} onChange={(event) => setPrivacyAgreed(event.target.checked)} />
                <span>{siteSettings.privacyPolicy}</span>
              </label>
              <label className="flex gap-3 rounded-lg bg-[#f8f1e3] p-4 text-sm leading-6">
                <input type="checkbox" checked={cautionAgreed} onChange={(event) => setCautionAgreed(event.target.checked)} />
                <span>{reservationCautions.join(" ")}</span>
              </label>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="text-xl font-bold">결제 및 환불 정보</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["bank_transfer", "계좌입금", "사무장님이 예약 가능 여부를 확인한 뒤 입금 계좌를 안내합니다."],
                  ["online", "온라인결제", "관리자 결제 요청 후 내 예약/예약조회에서 결제할 수 있습니다."],
                ].map(([value, title, text]) => (
                  <button key={value} type="button" onClick={() => setPaymentMethod(value as PaymentMethod)} className={`rounded-lg border p-5 text-left ${paymentMethod === value ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6]"}`}>
                    <span className="font-bold">{title}</span>
                    <span className="mt-2 block text-sm text-[#617064]">{text}</span>
                  </button>
                ))}
              </div>
              {paymentMethod === "bank_transfer" ? (
                <div className="mt-5 grid gap-3 rounded-lg bg-[#f8f1e3] p-4">
                  <input placeholder="입금자명" value={depositorName} onChange={(event) => setDepositorName(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input placeholder="환불 은행" value={refundBankName} onChange={(event) => setRefundBankName(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
                    <input placeholder="환불 계좌번호" value={refundAccountNumber} onChange={(event) => setRefundAccountNumber(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
                    <input placeholder="환불 예금주" value={refundAccountHolder} onChange={(event) => setRefundAccountHolder(event.target.value)} className="rounded-md border border-[#d6cab5] px-3 py-3" />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="rounded-lg bg-[#edf7f1] p-6">
              <Check className="h-10 w-10 text-[#24573a]" />
              <h2 className="mt-4 text-2xl font-bold">신청 전 최종 확인</h2>
              <p className="mt-3 leading-7 text-[#516257]">{siteSettings.reservationGuide}</p>
              <button type="button" onClick={submit} className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white">
                <CalendarCheck className="h-5 w-5" /> 예약 신청 완료
              </button>
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="mt-6 flex justify-between">
          <button type="button" onClick={() => setStep((value) => Math.max(value - 1, 0))} disabled={step === 0} className="inline-flex items-center gap-2 rounded-md border border-[#d7ccb7] px-4 py-2 font-bold disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> 이전
          </button>
          {step < 5 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 font-bold text-white">
              다음 <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>
      <aside className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-bold">예약 요약</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-[#6b715f]">방문일</dt>
            <dd className="font-bold">{visitDate || "-"}</dd>
          </div>
          <div>
            <dt className="text-[#6b715f]">인원</dt>
            <dd className="font-bold">{totalPeople}명</dd>
          </div>
          <div>
            <dt className="text-[#6b715f]">선택 체험</dt>
            <dd className="mt-2 grid gap-2">
              {selectedItems.length === 0 ? <span className="font-bold">-</span> : null}
              {selectedItems.map(({ schedule, product, amount }) => (
                <span key={schedule.id} className="rounded-md bg-[#f8f1e3] p-3">
                  <span className="block font-bold">{product?.name ?? "체험"}</span>
                  <span className="block text-xs text-[#617064]">{timeText(schedule, product)}</span>
                  <span className="block text-xs font-bold text-[#24573a]">{amount == null ? "문의 후 안내" : formatCurrency(amount)}</span>
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-[#6b715f]">총 예상금액</dt>
            <dd className="font-bold text-[#24573a]">{selectedItems.length === 0 ? "-" : totalAmount == null ? "문의 후 안내" : formatCurrency(totalAmount)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
