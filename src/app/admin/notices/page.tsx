"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { deleteNotice, listNotices, saveNotice } from "@/services/notices.service";

export default function AdminNoticesPage() {
  const [version, setVersion] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const notices = listNotices();

  return (
    <ProtectedRoute>
      <AdminShell title="공지사항 관리">
        <form
          className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            saveNotice({ id: `notice-${Date.now()}`, title, content, visible: true, pinned: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            setTitle("");
            setContent("");
            setVersion(version + 1);
          }}
        >
          <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="공지 제목" className="w-full rounded-md border border-[#d6cab5] px-3 py-3" />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} required placeholder="공지 내용" className="mt-3 min-h-32 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
          <button className="mt-3 rounded-md bg-[#24573a] px-4 py-2 font-bold text-white">공지 등록</button>
        </form>
        <div className="mt-6 divide-y divide-[#eee4d4] rounded-lg border border-[#e4d9c5] bg-white shadow-sm">
          {notices.map((notice) => (
            <div key={`${notice.id}-${version}`} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div><p className="font-bold">{notice.title}</p><p className="mt-1 line-clamp-1 text-sm text-[#687166]">{notice.content}</p></div>
              <button className="rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700" type="button" onClick={() => { deleteNotice(notice.id); setVersion(version + 1); }}>삭제</button>
            </div>
          ))}
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
