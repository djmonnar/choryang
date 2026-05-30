"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Search } from "lucide-react";
import { listReservations } from "@/services/reservations.service";
import { formatCurrency } from "@/lib/utils/format";
import { paymentMethodLabels, reservationStatusLabels, type Reservation } from "@/types/reservation";
import type { PublicUser } from "@/types/user";

export function MyPageClient() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.json() as Promise<{ user: PublicUser | null }>)
      .then((data) => {
        setUser(data.user);
        if (data.user) {
          setReservations(listReservations().filter((reservation) => reservation.userId === data.user?.id));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">회원 정보를 확인하고 있습니다.</p>;
  }

  if (!user) {
    return (
      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">로그인이 필요합니다</h2>
        <p className="mt-3 leading-7 text-[#5d665e]">네이버 로그인 후 예약하면 이곳에서 내 예약을 더 쉽게 확인할 수 있습니다.</p>
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
      <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e7894]">Naver Member</p>
        <h2 className="mt-2 text-2xl font-bold">{user.name || user.nickname || "회원"}님, 반갑습니다</h2>
        <p className="mt-3 leading-7 text-[#5d665e]">네이버 로그인으로 예약하면 예약자 정보가 자동 입력되고, 내 예약 화면에서 예약 내역을 모아볼 수 있습니다.</p>
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
                  <p className="font-bold text-[#1d261f]">{reservation.productName}</p>
                  <p className="mt-1 text-sm text-[#5d665e]">
                    {reservation.date} {reservation.startTime} · {reservation.totalPeople}명 · {reservation.reservationNumber}
                  </p>
                </div>
                <span className="rounded bg-[#edf7f1] px-2 py-1 text-xs font-bold text-[#24573a]">{reservationStatusLabels[reservation.status]}</span>
              </div>
              <p className="mt-3 text-sm text-[#5d665e]">
                {paymentMethodLabels[reservation.paymentMethod]} · {reservation.totalAmount == null ? "문의 후 안내" : formatCurrency(reservation.totalAmount)}
              </p>
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
