import { MapPin, Phone } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";
import { siteSettings } from "@/data/siteSettings";

export default function LocationPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="Location" title="오시는 길" description={siteSettings.address} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-[#8db9ad] bg-[#dcebe7] text-center">
          <div>
            <MapPin className="mx-auto h-12 w-12 text-[#1e7894]" />
            <p className="mt-3 text-xl font-bold">지도 영역 placeholder</p>
            <p className="mt-2 text-sm text-[#5f6a63]">Naver/Kakao 지도 API 또는 iframe으로 교체하세요.</p>
          </div>
        </div>
        <aside className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">방문 안내</h2>
          <p className="mt-4 leading-7 text-[#5d665e]">주소: {siteSettings.address}</p>
          <p className="mt-3 leading-7 text-[#5d665e]">주차: 마을 방문객 주차 가능 여부는 예약 확정 시 안내드립니다.</p>
          <p className="mt-3 flex items-center gap-2 font-bold text-[#24573a]"><Phone className="h-5 w-5" /> {siteSettings.managerPhone}</p>
        </aside>
      </div>
    </main>
  );
}
