"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Search } from "lucide-react";
import { TossPaymentButton } from "@/components/payment/TossPaymentButton";
import { PaymentProgressNotice } from "@/components/payment/PaymentProgressNotice";
import { ReservationCancelButton } from "@/components/reservation/ReservationCancelButton";
import { listMyReservations } from "@/services/reservations.service";
import { formatCurrency } from "@/lib/utils/format";
import { formatReservationItemTime, getReservationItems, getReservationTitle } from "@/lib/utils/reservationItems";
import { paymentMethodLabels, reservationStatusLabels, type Reservation } from "@/types/reservation";
import type { PublicUser } from "@/types/user";

export function MyPageClient() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.json() as Promise<{ user: PublicUser | null }>)
      .then((data) => {
        setUser(data.user);
        if (data.user) listMyReservations().then(setReservations).catch(() => setReservations([]));
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">회원 정보를 확인하고 있습니다.</p>;
  }

  if (!user) {
    const authError = searchParams.get("authError");
    return (
      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">로그인이 필요합니다</h2>
        <p className="mt-3 leading-7 text-[#5d665e]">네이버 로그인 후 이 화면에서 고객정보와 내 예약을 확인할 수 있습니다.</p>
        {authError ? (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            네이버 로그인 처리가 완료되지 않았습니다. Vercel 환경변수와 네이버 Callback URL을 확인한 뒤 다시 시도해 주세요.
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/api/auth/naver/login" className="inline-flex items-center gap-2 rounded-md bg-[#03c75a] px-5 py-3 font-bold text-white">
            네이버 로그인
          </Link>
          <Link href="/reservation/check" className="inline-flex items-center gap-2 rounded-md border border-[#d7ccb7] px-5 py-3 font-bold text-[#3c4439]">
            <Search className="h-5 w-5" /> 예약번호로 조회
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      {searchParams.get("login") === "success" ? (
        <div className="rounded-lg border border-[#b7ddc6] bg-[#edf7f1] p-5 text-sm font-semibold text-[#24573a] shadow-sm">
          네이버 로그인이 완료되었습니다. 아래 고객정보와 예약 내역을 확인해 주세요.
        </div>
      ) : null}

      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e7894]">Naver Member</p>
        <h2 className="mt-2 text-2xl font-bold">로그인된 고객정보</h2>
        <p className="mt-3 leading-7 text-[#5d665e]">
          {user.name || user.nickname || "회원"}님은 네이버 로그인으로 다슬기초량마을 회원 처리되었습니다. 예약 신청 시 아래 정보가 자동 입력됩니다.
        </p>
      </section>

      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">네이버 제공 회원정보</h2>
        <p className="mt-2 text-sm leading-6 text-[#5d665e]">
          예약자 정보 자동 입력과 예약 안내 연락을 위해 네이버에서 제공받은 회원정보를 사용합니다.
        </p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-[#f8f1e3] p-4">
            <dt className="font-bold text-[#24573a]">회원이름</dt>
            <dd className="mt-2 text-[#1d261f]">{user.name || user.nickname || "제공 정보 없음"}</dd>
          </div>
          <div className="rounded-lg bg-[#f8f1e3] p-4">
            <dt className="font-bold text-[#24573a]">이메일 주소</dt>
            <dd className="mt-2 text-[#1d261f]">{user.email || "제공 정보 없음"}</dd>
          </div>
          <div className="rounded-lg bg-[#f8f1e3] p-4">
            <dt className="font-bold text-[#24573a]">휴대전화번호</dt>
            <dd className="mt-2 text-[#1d261f]">{user.mobile || "제공 정보 없음"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">내 예약</h2>
          <Link href="/reservation" className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 text-sm font-bold text-white">
            <CalendarCheck className="h-4 w-4" /> 새 예약 신청
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="rounded-lg border border-[#e8dfcf] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#1d261f]">{getReservationTitle(reservation)}</p>
                  <p className="mt-1 text-sm text-[#5d665e]">
                    {reservation.visitDate ?? reservation.date} · {reservation.totalPeople}명 · {reservation.reservationNumber}
                  </p>
                </div>
                <span className="rounded bg-[#edf7f1] px-2 py-1 text-xs font-bold text-[#24573a]">{reservationStatusLabels[reservation.status]}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {getReservationItems(reservation).map((item) => (
                  <div key={`${item.scheduleId}-${item.startTime}`} className="rounded-md bg-[#f8f1e3] p-3 text-sm">
                    <p className="font-bold">{item.productName}</p>
                    <p className="mt-1 text-[#5d665e]">
                      {formatReservationItemTime(item)} · {item.totalPeople}명
                      {item.priceOptionLabel ? ` · ${item.priceOptionLabel}` : ""} · {item.amount == null ? "문의 후 안내" : formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#5d665e]">
                {paymentMethodLabels[reservation.paymentMethod]} · {reservation.totalAmount == null ? "문의 후 안내" : formatCurrency(reservation.totalAmount)}
              </p>
              <PaymentProgressNotice reservation={reservation} />
              <ReservationCancelButton
                reservation={reservation}
                onCancelled={(updated) => {
                  setReservations((items) => items.map((item) => (item.id === updated.id ? updated : item)));
                }}
              />
              <TossPaymentButton reservation={reservation} />
            </article>
          ))}
          {reservations.length === 0 ? (
            <div className="rounded-lg bg-[#f8f1e3] p-5 text-sm leading-6 text-[#5d665e]">
              아직 네이버 회원으로 신청한 예약이 없습니다. 기존 비회원 예약은 예약번호와 연락처로 조회해 주세요.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
