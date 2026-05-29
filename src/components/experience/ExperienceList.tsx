"use client";

import { useMemo, useState } from "react";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { seedProducts } from "@/data/seedProducts";
import type { ProductCategory } from "@/types/product";
import { productCategoryLabels } from "@/types/product";

const categories: Array<ProductCategory | "all"> = ["all", "water_ecology", "making", "farming", "healing"];

export function ExperienceList() {
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const products = useMemo(
    () =>
      seedProducts.filter(
        (product) =>
          product.visible &&
          product.bookingEnabled &&
          (category === "all" || product.category === category),
      ),
    [category],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            className={`rounded-md border px-4 py-2 text-sm font-bold ${category === item ? "border-[#24573a] bg-[#24573a] text-white" : "border-[#d8cdb9] bg-white text-[#354037]"}`}
            key={item}
            onClick={() => setCategory(item)}
            type="button"
          >
            {item === "all" ? "전체" : productCategoryLabels[item]}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ExperienceCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
