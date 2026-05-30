"use client";

import { useEffect, useState } from "react";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { listPublicProducts } from "@/services/catalog.service";
import type { Product } from "@/types/product";

export function FeaturedExperiences() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    listPublicProducts()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data.filter((product) => product.bookingEnabled).slice(0, 4));
      })
      .catch((caught) => {
        if (!isMounted) return;
        setError(caught instanceof Error ? caught.message : "대표 체험을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-lg border border-[#e6dcc9] bg-white shadow-sm" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="mt-8 rounded-lg bg-[#f8f1e3] px-4 py-3 text-sm font-semibold text-[#5f675a]">현재 노출 중인 대표 체험이 없습니다.</p>;
  }

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ExperienceCard key={product.id} product={product} compact />
      ))}
    </div>
  );
}
