"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KEY = "choryang.adminSession";

export function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function loginAdmin(email: string, password: string) {
  const mockMode = process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== "false";
  if (mockMode && email === "admin@choryang.local" && password === "choryang1234") {
    window.localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function logoutAdmin() {
  window.localStorage.removeItem(KEY);
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);
  if (!ready) return <div className="section-shell py-14">관리자 권한을 확인하는 중입니다.</div>;
  return children;
}
