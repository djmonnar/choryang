import { SectionHeader } from "@/components/common/SectionHeader";
import { StayFoodCatalog } from "@/components/stay-food/StayFoodCatalog";

export default function StayFoodPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader
        align="left"
        eyebrow="Stay & Food"
        title="숙박·식사 안내"
        description="숙박은 예약 가능한 날짜를 확인해 신청할 수 있고, 식사는 전화 문의로 안내합니다."
      />
      <StayFoodCatalog />
    </main>
  );
}
