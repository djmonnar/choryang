import { notFound } from "next/navigation";
import { seedNotices } from "@/data/seedNotices";

export function generateStaticParams() {
  return seedNotices.map((notice) => ({ id: notice.id }));
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = seedNotices.find((item) => item.id === id);
  if (!notice) notFound();
  return (
    <main className="section-shell py-14">
      <article className="rounded-lg border border-[#e7decb] bg-white p-8 shadow-sm">
        <p className="text-sm font-bold text-[#1e7894]">공지사항</p>
        <h1 className="mt-3 text-3xl font-black">{notice.title}</h1>
        <p className="mt-2 text-sm text-[#687166]">{new Date(notice.createdAt).toLocaleDateString("ko-KR")}</p>
        <div className="mt-8 whitespace-pre-wrap leading-8 text-[#3f4a42]">{notice.content}</div>
      </article>
    </main>
  );
}
