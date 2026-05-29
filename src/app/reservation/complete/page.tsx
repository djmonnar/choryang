import { Suspense } from "react";
import { ReservationCompleteClient } from "@/components/reservation/ReservationCompleteClient";

export default function ReservationCompletePage() {
  return (
    <main className="section-shell py-14">
      <Suspense fallback={<div className="mx-auto max-w-2xl rounded-lg bg-white p-8">예약 완료 화면을 불러오는 중입니다.</div>}>
        <ReservationCompleteClient />
      </Suspense>
    </main>
  );
}
