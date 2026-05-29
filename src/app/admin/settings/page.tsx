"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { getSiteSettings, saveSiteSettings } from "@/services/siteSettings.service";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(getSiteSettings());
  const [saved, setSaved] = useState(false);
  const fields: Array<[keyof typeof settings, string]> = [
    ["managerName", "대표 담당자"],
    ["managerPhone", "대표 연락처"],
    ["address", "주소"],
    ["bankName", "은행명"],
    ["bankAccount", "계좌번호"],
    ["bankHolder", "예금주"],
  ];

  return (
    <ProtectedRoute>
      <AdminShell title="사이트 설정">
        <form
          className="rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            saveSiteSettings(settings);
            setSaved(true);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([key, label]) => (
              <label key={key} className="block text-sm font-bold">
                {label}
                <input value={settings[key]} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3 font-normal" />
              </label>
            ))}
          </div>
          {[
            ["reservationGuide", "예약 안내 문구"],
            ["privacyPolicy", "개인정보처리방침 문구"],
            ["refundGuide", "환불 안내 문구"],
          ].map(([key, label]) => (
            <label key={key} className="mt-4 block text-sm font-bold">
              {label}
              <textarea value={settings[key as keyof typeof settings]} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} className="mt-2 min-h-28 w-full rounded-md border border-[#d6cab5] px-3 py-3 font-normal" />
            </label>
          ))}
          <button className="mt-5 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white">설정 저장</button>
          {saved ? <p className="mt-3 text-sm font-bold text-[#24573a]">저장되었습니다.</p> : null}
        </form>
      </AdminShell>
    </ProtectedRoute>
  );
}
