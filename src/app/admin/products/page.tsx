"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import { productCategoryLabels, seasonLabels } from "@/types/product";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products", { credentials: "include" });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as { products?: Product[]; error?: string };
      if (!response.ok) throw new Error(data.error || "상품 목록을 불러오지 못했습니다.");
      setProducts(data.products ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "상품 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => product.name.toLowerCase().includes(keyword));
  }, [products, query]);

  async function updateProduct(id: string, update: Partial<Product>) {
    setSavingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(update),
      });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) throw new Error(data.error || "상품을 수정하지 못했습니다.");
      setProducts((current) => current.map((product) => (product.id === id ? data.product as Product : product)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "상품을 수정하지 못했습니다.");
    } finally {
      setSavingId("");
    }
  }

  async function seedCatalog() {
    if (!window.confirm("고객 요청사항에 맞춘 최신 상품·일정 기본 데이터를 반영할까요? 기존 예약 인원은 유지됩니다.")) return;
    setSeeding(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/seed", { method: "POST", credentials: "include" });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "최신 기본 데이터를 반영하지 못했습니다.");
      setNotice("최신 상품·일정·식사·숙박 데이터를 반영했습니다.");
      await loadProducts();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "최신 기본 데이터를 반영하지 못했습니다.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <ProtectedRoute>
      <AdminShell title="상품 관리">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#e4d9c5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#526158]">고객 화면에 보일 상품과 예약 접수 여부를 바로 켜고 끌 수 있습니다.</p>
            <button type="button" disabled={seeding} onClick={() => void seedCatalog()} className="mt-3 rounded-md border border-[#24573a] px-3 py-2 text-sm font-black text-[#24573a] disabled:opacity-50">
              {seeding ? "최신 자료 반영 중..." : "고객 요청 최신 자료 반영"}
            </button>
          </div>
          <label className="relative block sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#69736c]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명 검색" className="w-full rounded-md border border-[#d6cab5] py-2 pl-9 pr-3 text-sm" />
          </label>
        </div>

        {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
        {notice ? <p className="mb-4 rounded-md bg-[#e9f5ee] px-4 py-3 text-sm font-bold text-[#24573a]">{notice}</p> : null}
        <div className="overflow-x-auto rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          {loading ? (
            <p className="flex items-center gap-2 py-8 text-sm font-bold text-[#59645d]"><Loader2 className="h-4 w-4 animate-spin" /> 상품을 불러오는 중입니다.</p>
          ) : (
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-[#f8f1e3]">
                <tr>
                  <th className="p-3">상품명</th>
                  <th className="p-3">카테고리</th>
                  <th className="p-3">계절</th>
                  <th className="p-3">가격</th>
                  <th className="p-3 text-center">고객 노출</th>
                  <th className="p-3 text-center">예약 접수</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-[#eee4d4]">
                    <td className="p-3 font-bold">{product.name}</td>
                    <td className="p-3">{productCategoryLabels[product.category]}</td>
                    <td className="p-3">{seasonLabels[product.season]}</td>
                    <td className="p-3">{formatPrice(product)}</td>
                    <td className="p-3 text-center">
                      <input
                        aria-label={`${product.name} 고객 노출`}
                        type="checkbox"
                        checked={product.visible}
                        disabled={savingId === product.id}
                        onChange={(event) => void updateProduct(product.id, { visible: event.target.checked })}
                        className="h-5 w-5 accent-[#24573a]"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        aria-label={`${product.name} 예약 접수`}
                        type="checkbox"
                        checked={product.bookingEnabled}
                        disabled={savingId === product.id}
                        onChange={(event) => void updateProduct(product.id, { bookingEnabled: event.target.checked })}
                        className="h-5 w-5 accent-[#24573a]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
