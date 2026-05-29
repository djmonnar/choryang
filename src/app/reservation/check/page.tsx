import { SectionHeader } from "@/components/common/SectionHeader";
import { ReservationCheck } from "@/components/reservation/ReservationCheck";

export default function ReservationCheckPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="Check" title="예약 확인" description="예약번호와 연락처로 신청 내역을 조회합니다." />
      <div className="mt-8">
        <ReservationCheck />
      </div>
    </main>
  );
}
