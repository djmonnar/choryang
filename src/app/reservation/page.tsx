import { Suspense } from "react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ReservationWizard } from "@/components/reservation/ReservationWizard";

export default function ReservationPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="Reservation" title="체험 예약 신청" description="관리자 확인 후 결제 안내가 진행되며, 입금 또는 온라인결제 확인 후 최종 확정됩니다." />
      <div className="mt-8">
        <Suspense fallback={<div className="rounded-lg bg-white p-8">예약 폼을 불러오는 중입니다.</div>}>
          <ReservationWizard />
        </Suspense>
      </div>
    </main>
  );
}
