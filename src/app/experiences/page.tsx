import { ExperienceList } from "@/components/experience/ExperienceList";
import { SectionHeader } from "@/components/common/SectionHeader";

export default function ExperiencesPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader
        align="left"
        eyebrow="Experiences"
        title="체험상품 안내"
        description="예약 가능한 체험만 모아봤습니다. 가격이 확정되지 않은 체험은 문의 후 안내드립니다."
      />
      <div className="mt-8">
        <ExperienceList />
      </div>
    </main>
  );
}
