import Link from "next/link";
import { SectionHeader } from "@/components/common/SectionHeader";
import { seedNotices } from "@/data/seedNotices";

export default function NoticesPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="Notices" title="공지사항" description="운영 일정, 준비물, 단체 예약 안내를 확인해 주세요." />
      <div className="mt-8 divide-y divide-[#e7decb] rounded-lg border border-[#e7decb] bg-white">
        {seedNotices.map((notice) => (
          <Link key={notice.id} href={`/notices/${notice.id}`} className="block p-6 hover:bg-[#fff8e8]">
            <div className="flex flex-wrap items-center gap-2">
              {notice.pinned ? <span className="rounded bg-[#24573a] px-2 py-1 text-xs font-bold text-white">고정</span> : null}
              <h2 className="text-lg font-bold">{notice.title}</h2>
            </div>
            <p className="mt-2 line-clamp-1 text-sm text-[#687166]">{notice.content}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
