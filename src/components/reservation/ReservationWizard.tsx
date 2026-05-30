"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { seedProducts } from "@/data/seedProducts";
import { reservationCautions, siteSettings } from "@/data/siteSettings";
import { seedSchedules } from "@/data/seedSchedules";
import { calculateAmount, formatCurrency } from "@/lib/utils/format";
import { createReservation } from "@/services/reservations.service";
import type { PaymentMethod } from "@/types/reservation";
import type { PublicUser } from "@/types/user";

const steps = ["체험 선택", "날짜 선택", "시간 선택", "인원 선택", "예약자 정보", "결제 방식", "신청 완료"];

export function ReservationWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialProductId = searchParams.get("productId") ?? seedProducts.find((item) => item.bookingEnabled)?.id ?? "";
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState(initialProductId);
  const [scheduleId, setScheduleId] = useState("");
  const [adultCount, setAdultCount] = useState(1);
  const [youthCount, setYouthCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [cautionAgreed, setCautionAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);

  const product = seedProducts.find((item) => item.id === productId);
  const schedules = useMemo(() => seedSchedules.filter((schedule) => schedule.productId === productId && schedule.status === "open"), [productId]);
  const schedule = schedules.find((item) => item.id === scheduleId);
  const dateOptions = [...new Set(schedules.map((item) => item.date))];
  const selectedDate = schedule?.date ?? dateOptions[0] ?? "";
  const schedulesForDate = schedules.filter((item) => item.date === selectedDate);
  const totalPeople = adultCount + youthCount + childCount;
  const amount = product ? calculateAmount(product, { adultCount, youthCount, childCount }) : null;

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

  function validateCurrentStep() {
    if (step === 0 && !productId) return "체험을 선택해 주세요.";
    if ((step === 1 || step === 2) && !scheduleId) return "날짜와 회차를 선택해 주세요.";
    if (step === 3 && totalPeople <= 0) return "인원은 1명 이상이어야 합니다.";
    if (step === 4) {
      if (!customerName.trim()) return "예약자 이름을 입력해 주세요.";
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim())) return "연락처 형식을 확인해 주세요.";
      if (!privacyAgreed) return "개인정보 수집 동의가 필요합니다.";
      if (!cautionAgreed) return "예약 유의사항 동의가 필요합니다.";
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
    if (message || !product || !schedule) {
      setError(message || "예약 정보를 확인해 주세요.");
      return;
    }
    try {
      const reservation = await createReservation({
        productId: product.id,
        productName: product.name,
        scheduleId: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        customerName,
        phone,
        email: email || undefined,
        adultCount,
        youthCount,
        childCount,
        paymentMethod,
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
        <ol className="grid grid-cols-2 gap-2 text-xs font-bold text-[#6a715f] md:grid-cols-7">
          {steps.map((label, index) => (
            <li key={label} className={`rounded-md px-3 py-2 text-center ${index === step ? "bg-[#24573a] text-white" : "bg-[#f5eedf]"}`}>
              {index + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="mt-8 min-h-[360px]">
          {step === 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {seedProducts.filter((item) => item.bookingEnabled).map((item) => (
                <button key={item.id} type="button" onClick={() => { setProductId(item.id); setScheduleId(""); }} className={`rounded-lg border p-4 text-left ${productId === item.id ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6] bg-white"}`}>
                  <span className="font-bold">{item.name}</span>
                  <span className="mt-2 block text-sm text-[#617064]">{item.description}</span>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-xl font-bold">날짜 선택</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dateOptions.map((date) => {
                  const first = schedules.find((item) => item.date === date);
                  return (
                    <button key={date} type="button" onClick={() => setScheduleId(first?.id ?? "")} className={`rounded-lg border p-4 text-left ${selectedDate === date ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6]"}`}>
                      <span className="font-bold">{date}</span>
                      <span className="block text-sm text-[#617064]">예약 가능한 회차 {schedules.filter((item) => item.date === date).length}개</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-xl font-bold">시간 회차 선택</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {schedulesForDate.map((item) => (
                  <button key={item.id} type="button" onClick={() => setScheduleId(item.id)} className={`rounded-lg border p-4 text-left ${scheduleId === item.id ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6]"}`}>
                    <span className="font-bold">{item.startTime}~{item.endTime}</span>
                    <span className="block text-sm text-[#617064]">정원 {item.capacity}명 / 남은 {item.capacity - item.reservedCount}명</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">인원 선택</h2>
              {[
                ["성인", adultCount, setAdultCount],
                ["중고등학생", youthCount, setYouthCount],
                ["유치원/초등학생", childCount, setChildCount],
              ].map(([label, value, setter]) => (
                <label key={label as string} className="grid gap-2 rounded-lg border border-[#e2d8c6] p-4 sm:grid-cols-[1fr_180px] sm:items-center">
                  <span className="font-bold">{label as string}</span>
                  <input type="number" min={0} value={value as number} onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))} className="rounded-md border border-[#d6cab5] px-3 py-2" />
                </label>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
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

          {step === 5 ? (
            <div>
              <h2 className="text-xl font-bold">결제 방식 선택</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["bank_transfer", "계좌입금", "관리자가 가능 여부 확인 후 입금 계좌를 안내합니다."],
                  ["online", "온라인결제", "1차 MVP에서는 mock 결제 요청으로 기록됩니다."],
                ].map(([value, title, text]) => (
                  <button key={value} type="button" onClick={() => setPaymentMethod(value as PaymentMethod)} className={`rounded-lg border p-5 text-left ${paymentMethod === value ? "border-[#24573a] bg-[#edf7f1]" : "border-[#e2d8c6]"}`}>
                    <span className="font-bold">{title}</span>
                    <span className="mt-2 block text-sm text-[#617064]">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 6 ? (
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
          {step < 6 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 font-bold text-white">
              다음 <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>
      <aside className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-bold">예약 요약</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div><dt className="text-[#6b715f]">체험</dt><dd className="font-bold">{product?.name ?? "-"}</dd></div>
          <div><dt className="text-[#6b715f]">일시</dt><dd className="font-bold">{schedule ? `${schedule.date} ${schedule.startTime}` : "-"}</dd></div>
          <div><dt className="text-[#6b715f]">인원</dt><dd className="font-bold">{totalPeople}명</dd></div>
          <div><dt className="text-[#6b715f]">예상금액</dt><dd className="font-bold text-[#24573a]">{amount == null ? "문의 후 안내" : formatCurrency(amount)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
