"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/components/admin/auth";

const nav = [
  ["대시보드", "/admin"],
  ["예약관리", "/admin/reservations"],
  ["상품관리", "/admin/products"],
  ["일정관리", "/admin/schedules"],
  ["결제관리", "/admin/payments"],
  ["공지관리", "/admin/notices"],
  ["설정", "/admin/settings"],
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="section-shell grid gap-6 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-[#e4d9c5] bg-white p-4 shadow-sm">
        <p className="px-3 text-sm font-bold text-[#1e7894]">관리자</p>
        <nav className="mt-3 grid gap-1">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={`rounded-md px-3 py-2 text-sm font-bold ${pathname === href ? "bg-[#24573a] text-white" : "hover:bg-[#f8f1e3]"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-5 w-full rounded-md border border-[#d7ccb7] px-3 py-2 text-sm font-bold"
          onClick={() => {
            logoutAdmin();
            router.push("/admin/login");
          }}
          type="button"
        >
          로그아웃
        </button>
      </aside>
      <section>
        <h1 className="text-3xl font-black">{title}</h1>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
