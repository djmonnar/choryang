"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const KEY = "choryang.adminSession";

export function isAdminLoggedInLocal() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export async function loginAdmin(input: { email?: string; password?: string; secret?: string }) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) return false;
  window.localStorage.setItem(KEY, "true");
  return true;
}

export async function logoutAdmin() {
  await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => null);
  window.localStorage.removeItem(KEY);
}

export async function isAdminLoggedIn() {
  const response = await fetch("/api/admin/session", { credentials: "include" }).catch(() => null);
  if (!response?.ok) return false;
  const data = (await response.json()) as { authenticated?: boolean };
  return Boolean(data.authenticated);
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    isAdminLoggedIn().then((authenticated) => {
      if (!authenticated) {
        window.localStorage.removeItem(KEY);
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    });
  }, [router]);
  if (!ready) return <div className="section-shell py-14">관리자 권한을 확인하는 중입니다.</div>;
  return children;
}
