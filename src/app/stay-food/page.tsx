import { Phone } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { siteSettings } from "@/data/siteSettings";
import { withBasePath } from "@/lib/utils/publicPath";

export default function StayFoodPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader
        align="left"
        eyebrow="Stay & Food"
        title="숙박·식사 안내"
        description="1차 MVP에서는 숙박과 식사는 예약 기능을 제공하지 않고, 전화 문의 중심으로 안내합니다."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[
          ["/images/choryang/stay-01.jpg", "숙박 안내", "제비콩방, 조롱박방, 작두콩방 등 숙박은 운영 가능 여부와 인원 확인 후 안내드립니다."],
          ["/images/choryang/food-table-01.jpg", "식사 안내", "자연밥상, 다슬기탕, 도토리묵밥, 조식은 체험 일정과 단체 인원에 따라 문의 후 안내드립니다."],
        ].map(([src, title, text]) => (
          <article key={title} className="overflow-hidden rounded-lg border border-[#e4d9c5] bg-white shadow-sm">
            <img src={withBasePath(src)} alt={title} className="h-64 w-full object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-[#5d665e]">{text}</p>
              <Link href={`tel:${siteSettings.managerPhone}`} className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white">
                <Phone className="h-5 w-5" /> 문의하기 {siteSettings.managerPhone}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
