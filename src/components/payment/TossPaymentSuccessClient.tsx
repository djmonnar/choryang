"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { confirmTossPayment } from "@/services/toss-payments.service";

export function TossPaymentSuccessClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("결제 승인을 확인하고 있습니다.");

  const params = useMemo(
    () => ({
      paymentKey: searchParams.get("paymentKey") ?? "",
      orderId: searchParams.get("orderId") ?? "",
      amount: Number(searchParams.get("amount") ?? 0),
    }),
    [searchParams],
  );

  useEffect(() => {
    if (!params.paymentKey || !params.orderId || !Number.isFinite(params.amount) || params.amount <= 0) {
      setStatus("error");
      setMessage("결제 승인 정보가 올바르지 않습니다.");
      return;
    }

    confirmTossPayment(params)
      .then(() => {
        setStatus("success");
        setMessage("결제가 완료되었습니다. 예약 상태가 결제완료로 변경되었습니다.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "결제 승인 중 오류가 발생했습니다.");
      });
  }, [params]);

  return (
    <section className="section-shell py-14">
      <div className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1e7894]">Payment</p>
        <h1 className="mt-2 text-2xl font-bold">{status === "success" ? "결제가 완료되었습니다" : status === "error" ? "결제 확인이 필요합니다" : "결제 승인 중"}</h1>
        <p className="mt-4 leading-7 text-[#5d665e]">{message}</p>
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
