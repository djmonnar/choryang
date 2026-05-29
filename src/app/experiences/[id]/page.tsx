import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seedProducts } from "@/data/seedProducts";
import { formatPrice } from "@/lib/utils/format";
import { productCategoryLabels, seasonLabels } from "@/types/product";

export function generateStaticParams() {
  return seedProducts.map((product) => ({ id: product.id }));
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = seedProducts.find((item) => item.id === id);
  if (!product) notFound();

  return (
    <main className="section-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <img src={product.imageUrl} alt={product.name} className="h-[420px] w-full rounded-lg object-cover shadow-sm" />
        <section className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-[#e8f4ef] px-2 py-1 text-xs font-bold text-[#24573a]">{productCategoryLabels[product.category]}</span>
            <span className="rounded bg-[#eef5fb] px-2 py-1 text-xs font-bold text-[#1e7894]">{seasonLabels[product.season]}</span>
          </div>
          <h1 className="mt-4 text-3xl font-black">{product.name}</h1>
          <p className="mt-4 leading-8 text-[#586259]">{product.description}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-[#6d735f]">가격</dt><dd className="mt-1 font-bold text-[#24573a]">{formatPrice(product)}</dd></div>
            <div><dt className="text-[#6d735f]">대상</dt><dd className="mt-1 font-bold">가족, 어린이집, 학교, 단체</dd></div>
            <div><dt className="text-[#6d735f]">소요시간</dt><dd className="mt-1 font-bold">{product.durationMinutes ?? 90}분</dd></div>
            <div><dt className="text-[#6d735f]">운영계절</dt><dd className="mt-1 font-bold">{seasonLabels[product.season]}</dd></div>
          </dl>
          <div className="mt-6 rounded-lg bg-[#f8f1e3] p-4 text-sm leading-6 text-[#67583c]">
            <p className="font-bold">준비물/유의사항</p>
            <p className="mt-1">{product.caution}</p>
            <p className="mt-2">체험은 계절 및 마을 사정에 따라 변동될 수 있습니다.</p>
          </div>
          <Link
            href={product.bookingEnabled ? `/reservation?productId=${product.id}` : "/stay-food"}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white"
          >
            <CalendarCheck className="h-5 w-5" /> {product.bookingEnabled ? "예약하기" : "문의하기"}
          </Link>
        </section>
      </div>
    </main>
  );
}
