"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/components/admin/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@choryang.local");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  return (
    <main className="section-shell py-14">
      <form
        className="mx-auto max-w-md rounded-lg border border-[#e4d9c5] bg-white p-7 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await loginAdmin({ email, password, secret })) {
            router.push("/admin");
          } else {
            setError("관리자 계정을 확인해 주세요.");
          }
        }}
      >
        <p className="text-sm font-bold text-[#1e7894]">Admin</p>
        <h1 className="mt-2 text-3xl font-black">관리자 로그인</h1>
        <label className="mt-6 block text-sm font-bold">이메일</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
        <label className="mt-4 block text-sm font-bold">비밀번호</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
        <label className="mt-4 block text-sm font-bold">관리자 비밀키</label>
        <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className="mt-2 w-full rounded-md border border-[#d6cab5] px-3 py-3" />
        <button className="mt-6 w-full rounded-md bg-[#24573a] px-4 py-3 font-bold text-white">로그인</button>
        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
        <p className="mt-5 text-sm leading-6 text-[#687166]">운영 환경에서는 Vercel의 ADMIN_SECRET 또는 ADMIN_EMAIL/ADMIN_PASSWORD로 인증합니다.</p>
      </form>
    </main>
  );
}
