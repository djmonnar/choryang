import { Phone } from "lucide-react";
import { NaverMap } from "@/components/common/NaverMap";
import { SectionHeader } from "@/components/common/SectionHeader";
import { siteSettings } from "@/data/siteSettings";

const villageLocation = { lat: 35.1060526, lng: 127.9235548 };

export default function LocationPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="Location" title="오시는 길" description={siteSettings.address} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <NaverMap
          lat={villageLocation.lat}
          lng={villageLocation.lng}
          title="다슬기초량마을"
          address={siteSettings.address}
          className="min-h-96 border border-[#c8ddd6] bg-[#dcebe7]"
        />
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
