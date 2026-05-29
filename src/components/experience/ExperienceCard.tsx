import { CalendarCheck, Info } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/product";
import { productCategoryLabels, seasonLabels } from "@/types/product";

export function ExperienceCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const status = product.bookingEnabled ? (product.priceType === "inquiry" ? "문의필요" : "예약가능") : "안내전용";
  return (
    <article className="overflow-hidden rounded-lg border border-[#e6dcc9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img src={product.imageUrl} alt={product.name} className={compact ? "h-36 w-full object-cover" : "h-52 w-full object-cover"} />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-[#e8f4ef] px-2 py-1 text-xs font-bold text-[#24573a]">{productCategoryLabels[product.category]}</span>
          <span className="rounded bg-[#eef5fb] px-2 py-1 text-xs font-bold text-[#1e7894]">{seasonLabels[product.season]}</span>
          <span className="rounded bg-[#f4eee0] px-2 py-1 text-xs font-bold text-[#6c4f35]">{status}</span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-[#1d261f]">{product.name}</h3>
        {!compact ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#616960]">{product.description}</p> : null}
        <p className="mt-3 text-sm font-semibold text-[#24573a]">{formatPrice(product)}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/experiences/${product.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7ccb7] px-3 py-2 text-sm font-semibold">
            <Info className="h-4 w-4" /> 상세
          </Link>
          <Link
            href={product.bookingEnabled ? `/reservation?productId=${product.id}` : "/stay-food"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#24573a] px-3 py-2 text-sm font-semibold text-white"
          >
            <CalendarCheck className="h-4 w-4" /> {product.bookingEnabled ? "예약" : "문의"}
          </Link>
        </div>
      </div>
    </article>
  );
}
