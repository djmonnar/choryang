import { CalendarCheck, Home, Search } from "lucide-react";
import Link from "next/link";
import { siteSettings } from "@/data/siteSettings";

export default async function ReservationCompletePage({ searchParams }: { searchParams: Promise<{ reservationNumber?: string }> }) {
  const { reservationNumber } = await searchParams;
  return (
    <main className="section-shell py-14">
      <section className="mx-auto max-w-2xl rounded-lg border border-[#e4d9c5] bg-white p-8 text-center shadow-sm">
        <CalendarCheck className="mx-auto h-14 w-14 text-[#24573a]" />
        <h1 className="mt-5 text-3xl font-black">예약 신청이 접수되었습니다</h1>
        <p className="mt-4 leading-8 text-[#586259]">{siteSettings.reservationGuide}</p>
        <div className="mt-6 rounded-lg bg-[#f8f1e3] p-5">
          <p className="text-sm text-[#6b715f]">예약번호</p>
          <p className="mt-1 text-2xl font-black text-[#24573a]">{reservationNumber ?? "예약번호 없음"}</p>
        </div>
        <p className="mt-5 font-bold">{siteSettings.managerName} {siteSettings.managerPhone}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7ccb7] px-5 py-3 font-bold">
            <Home className="h-5 w-5" /> 홈으로
          </Link>
          <Link href="/reservation/check" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white">
            <Search className="h-5 w-5" /> 예약 확인
          </Link>
        </div>
      </section>
    </main>
  );
}
