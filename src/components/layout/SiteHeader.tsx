"use client";

import { CalendarCheck, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/utils/publicPath";
import type { PublicUser } from "@/types/user";

const navItems = [
  ["마을소개", "/about"],
  ["체험예약", "/reservation"],
  ["체험상품", "/experiences"],
  ["숙박·식사", "/stay-food"],
  ["오시는 길", "/location"],
  ["공지사항", "/notices"],
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const naverLoginEnabled = process.env.NEXT_PUBLIC_NAVER_LOGIN_ENABLED !== "false";
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!naverLoginEnabled) return;
    let isMounted = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.json() as Promise<{ user: PublicUser | null }>)
      .then((data) => {
        if (isMounted) setUser(data.user);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, [naverLoginEnabled]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    closeMenu();
  }

  const authLinks = user ? (
    <>
      <Link href="/mypage" className="inline-flex items-center gap-2 rounded-md border border-[#d7ccb7] px-4 py-2 text-sm font-semibold text-[#3c4439]">
        내 예약
      </Link>
      <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-md bg-[#f4eee0] px-4 py-2 text-sm font-semibold text-[#24573a]">
        로그아웃
      </button>
    </>
  ) : naverLoginEnabled ? (
    <Link href="/api/auth/naver/login" className="inline-flex items-center gap-2 rounded-md bg-[#03c75a] px-4 py-2 text-sm font-semibold text-white">
      네이버 로그인
    </Link>
  ) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7decb] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3" aria-label="다슬기초량마을 홈" onClick={closeMenu}>
          <img
            src={withBasePath("/images/choryang/choryang-cute-icon.png")}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl object-contain shadow-sm"
            aria-hidden
          />
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
          {authLinks}
          <Link href="/reservation/check" className="inline-flex items-center gap-2 rounded-md border border-[#d7ccb7] px-4 py-2 text-sm font-semibold text-[#3c4439]">
            <Search className="h-4 w-4" /> 예약조회
          </Link>
          <Link href="/reservation" className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-4 py-2 text-sm font-semibold text-white">
            <CalendarCheck className="h-4 w-4" /> 예약신청
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#d7ccb7] text-[#24573a] transition hover:bg-[#f6f1e7] lg:hidden"
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        id="mobile-site-menu"
        className={`border-t border-[#e7decb] bg-white shadow-lg lg:hidden ${isMenuOpen ? "block" : "hidden"}`}
      >
        <nav className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-3 text-sm font-semibold text-[#2f3b32]" aria-label="모바일 메뉴">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-3 hover:bg-[#f6f1e7] hover:text-[#1e7894]" onClick={closeMenu}>
              {label}
            </Link>
          ))}
        </nav>
        {naverLoginEnabled ? (
          <div className="mx-auto grid w-full max-w-7xl gap-2 px-4 pb-2">
            {user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/mypage"
                  className="inline-flex items-center justify-center rounded-md border border-[#d7ccb7] px-3 py-3 text-sm font-semibold text-[#3c4439]"
                  onClick={closeMenu}
                >
                  내 예약
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center rounded-md bg-[#f4eee0] px-3 py-3 text-sm font-semibold text-[#24573a]"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/naver/login"
                className="inline-flex items-center justify-center rounded-md bg-[#03c75a] px-3 py-3 text-sm font-semibold text-white"
                onClick={closeMenu}
              >
                네이버 로그인
              </Link>
            )}
          </div>
        ) : null}
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-2 px-4 pb-4">
          <Link
            href="/reservation/check"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7ccb7] px-3 py-3 text-sm font-semibold text-[#3c4439]"
            onClick={closeMenu}
          >
            <Search className="h-4 w-4" /> 예약조회
          </Link>
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#24573a] px-3 py-3 text-sm font-semibold text-white"
            onClick={closeMenu}
          >
            <CalendarCheck className="h-4 w-4" /> 예약신청
          </Link>
        </div>
      </div>
    </header>
  );
}
