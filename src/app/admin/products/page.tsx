"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProtectedRoute } from "@/components/admin/auth";
import { listProducts, saveProduct } from "@/services/products.service";
import { formatPrice } from "@/lib/utils/format";
import { productCategoryLabels, seasonLabels } from "@/types/product";

export default function AdminProductsPage() {
  const [version, setVersion] = useState(0);
  const products = listProducts();
  return (
    <ProtectedRoute>
      <AdminShell title="상품 관리">
        <div className="overflow-x-auto rounded-lg border border-[#e4d9c5] bg-white p-5 shadow-sm">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-[#f8f1e3]"><tr><th className="p-3">상품명</th><th className="p-3">카테고리</th><th className="p-3">계절</th><th className="p-3">가격</th><th className="p-3">노출</th><th className="p-3">예약</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={`${product.id}-${version}`} className="border-t border-[#eee4d4]">
                  <td className="p-3 font-bold">{product.name}</td><td className="p-3">{productCategoryLabels[product.category]}</td><td className="p-3">{seasonLabels[product.season]}</td><td className="p-3">{formatPrice(product)}</td>
                  <td className="p-3"><input type="checkbox" defaultChecked={product.visible} onChange={(event) => { saveProduct({ ...product, visible: event.target.checked, updatedAt: new Date().toISOString() }); setVersion(version + 1); }} /></td>
                  <td className="p-3"><input type="checkbox" defaultChecked={product.bookingEnabled} onChange={(event) => { saveProduct({ ...product, bookingEnabled: event.target.checked, updatedAt: new Date().toISOString() }); setVersion(version + 1); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-[#687166]">MVP에서는 ON/OFF 중심으로 제공하며, 가격·계절·카테고리 편집은 같은 service 경계에서 확장 가능합니다.</p>
        </div>
      </AdminShell>
    </ProtectedRoute>
  );
}
