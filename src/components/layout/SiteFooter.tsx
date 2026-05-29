import Link from "next/link";
import { siteSettings } from "@/data/siteSettings";

export function SiteFooter() {
  return (
    <footer className="bg-[#123822] text-white">
      <div className="section-shell grid gap-8 py-10 md:grid-cols-[1fr_2fr_1fr]">
        <div>
          <p className="text-xl font-black">다슬기초량마을</p>
          <p className="mt-3 text-sm leading-6 text-white/75">청정 초량강과 함께하는 사천 농촌체험 휴양마을</p>
        </div>
        <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-3">
          {[
            ["마을소개", "/about"],
            ["체험상품", "/experiences"],
            ["예약신청", "/reservation"],
            ["숙박·식사", "/stay-food"],
            ["오시는 길", "/location"],
            ["관리자", "/admin"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="text-sm leading-6 text-white/75">
          <p>{siteSettings.address}</p>
          <p>{siteSettings.managerName} {siteSettings.managerPhone}</p>
          <p className="mt-3">Project: choryang</p>
        </div>
      </div>
    </footer>
  );
}
