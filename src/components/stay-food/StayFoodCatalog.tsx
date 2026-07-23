"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Loader2, Phone } from "lucide-react";
import Link from "next/link";
import { siteSettings } from "@/data/siteSettings";
import { formatPrice } from "@/lib/utils/format";
import { withBasePath } from "@/lib/utils/publicPath";
import { listPublicProducts } from "@/services/catalog.service";
import type { Product } from "@/types/product";

function ProductCard({ product, reservable }: { product: Product; reservable: boolean }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#e4d9c5] bg-white shadow-sm">
      <img src={withBasePath(product.imageUrl)} alt={product.name} className="h-52 w-full object-cover" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black">{product.name}</h3>
          <span className="shrink-0 rounded bg-[#edf7f1] px-2 py-1 text-xs font-black text-[#24573a]">
            {reservable ? "예약 가능" : "안내 전용"}
          </span>
        </div>
        <p className="mt-2 font-black text-[#24573a]">{formatPrice(product)}</p>
        <p className="mt-3 text-sm leading-6 text-[#5c675f]">{product.description}</p>
        {reservable ? (
          <Link href={`/reservation?productId=${product.id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#24573a] px-4 py-3 font-black text-white">
            <CalendarCheck className="h-5 w-5" /> 숙박 예약하기
          </Link>
        ) : (
          <a href={`tel:${siteSettings.managerPhone}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#24573a] px-4 py-3 font-black text-[#24573a]">
            <Phone className="h-5 w-5" /> 식사 문의하기
          </a>
        )}
      </div>
    </article>
  );
}

export function StayFoodCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    listPublicProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((caught) => {
        if (mounted) setError(caught instanceof Error ? caught.message : "숙박·식사 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="mt-8 flex items-center gap-2 rounded-lg bg-white p-5 font-bold shadow-sm"><Loader2 className="h-5 w-5 animate-spin" /> 숙박·식사 정보를 불러오는 중입니다.</p>;
  if (error) return <p className="mt-8 rounded-lg bg-red-50 p-5 font-bold text-red-700">{error}</p>;

  const rooms = products.filter((product) => product.category === "stay_info" && product.bookingEnabled);
  const foods = products.filter((product) => product.category === "food_info");

  return (
    <>
      <section className="mt-10">
        <div>
          <p className="text-sm font-black text-[#1e7894]">Stay</p>
          <h2 className="mt-2 text-2xl font-black">초량마을 숙박</h2>
          <p className="mt-2 text-[#5c675f]">객실별 운영 날짜와 남은 객실을 확인한 뒤 체험과 함께 예약할 수 있습니다.</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {rooms.map((product) => <ProductCard key={product.id} product={product} reservable />)}
        </div>
      </section>

      <section className="mt-14 border-t border-[#e4d9c5] pt-12">
        <div>
          <p className="text-sm font-black text-[#1e7894]">Food</p>
          <h2 className="mt-2 text-2xl font-black">식사와 단품 메뉴</h2>
          <p className="mt-2 text-[#5c675f]">식사는 온라인 예약을 받지 않습니다. 인원과 메뉴를 정한 뒤 사무장님께 문의해 주세요.</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((product) => <ProductCard key={product.id} product={product} reservable={false} />)}
        </div>
      </section>
    </>
  );
}
