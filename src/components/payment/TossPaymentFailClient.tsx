"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function TossPaymentFailClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <section className="section-shell py-14">
      <div className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">Payment Failed</p>
        <h1 className="mt-2 text-2xl font-bold">결제가 완료되지 않았습니다</h1>
        <p className="mt-4 leading-7 text-[#5d665e]">{message || "결제가 취소되었거나 실패했습니다. 다시 시도해 주세요."}</p>
        {code ? <p className="mt-3 text-sm font-semibold text-[#6b715f]">오류 코드: {code}</p> : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/mypage" className="rounded-md bg-[#24573a] px-5 py-3 font-bold text-white">
            내 예약 보기
          </Link>
          <Link href="/reservation/check" className="rounded-md border border-[#d7ccb7] px-5 py-3 font-bold text-[#3c4439]">
            예약번호로 조회
          </Link>
        </div>
      </div>
    </section>
  );
}
