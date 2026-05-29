import { CalendarCheck, Search } from "lucide-react";
import Link from "next/link";

const navItems = [
  ["마을소개", "/about"],
  ["체험예약", "/reservation"],
  ["체험상품", "/experiences"],
  ["숙박·식사", "/stay-food"],
  ["오시는 길", "/location"],
  ["공지사항", "/notices"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7decb] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3" aria-label="다슬기초량마을 홈">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#24573a] text-white">
            <span className="text-lg font-black">초</span>
          </span>
          <span>
            <span className="block text-lg font-black text-[#183721]">다슬기초량마을</span>
            <span className="hidden text-xs text-[#6b715f] sm:block">사천 농촌체험휴양마을</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#2f3b32] lg:flex" aria-label="주요 메뉴">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-[#1e7894]">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden gap-2 sm:flex">
          <Link href="/reservation/check" className="inline-flex items-center gap-2 rounded-md border border-[#d7ccb7] px-4 py-2 text-sm font-semibold text-[#3c4439]">
            <Search className="h-4 w-4" /> 예약조회
          </Link>
          <Link href="/reservation" className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 text-sm font-semibold text-white">
            <CalendarCheck className="h-4 w-4" /> 예약신청
          </Link>
        </div>
      </div>
    </header>
  );
}
