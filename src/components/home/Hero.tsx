import { ArrowDown, CalendarCheck, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { withBasePath } from "@/lib/utils/publicPath";

const heroSlides = [
  {
    image: "/images/choryang/hero-stream.jpg",
    position: "center center",
  },
  {
    image: "/images/choryang/village-view-01.jpg",
    position: "center center",
  },
  {
    image: "/images/choryang/education-center-01.jpg",
    position: "center center",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#14341f] text-white">
      <div className="absolute inset-0" aria-hidden>
        {heroSlides.map((slide, index) => (
          <div
            className="hero-slide absolute inset-0 bg-cover"
            key={slide.image}
            style={{
              animationDelay: `${index * 6}s`,
              backgroundImage: `url('${withBasePath(slide.image)}')`,
              backgroundPosition: slide.position,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" aria-hidden />
      <div className="relative z-10 flex min-h-[92vh] items-center">
        <div className="section-shell pt-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/80">사천 농촌체험휴양마을</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">사천 초량강에서 만나는 자연 체험 하루</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86 md:text-xl">
            다슬기잡이, 물고기잡이, 만들기 체험, 시골밥상까지 함께하는 초량마을
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reservation" className="inline-flex items-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-bold text-white shadow-lg">
              <CalendarCheck className="h-5 w-5" /> 체험 예약하기
            </Link>
            <Link href="#experiences" className="inline-flex items-center gap-2 rounded-md border border-white/60 bg-white/12 px-5 py-3 font-bold text-white backdrop-blur">
              <ImageIcon className="h-5 w-5" /> 마을 둘러보기
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm backdrop-blur md:flex">
        <ArrowDown className="h-4 w-4" /> 아래로 스크롤
      </div>
      <div className="absolute bottom-9 right-8 z-10 hidden gap-2 md:flex" aria-hidden>
        {heroSlides.map((slide, index) => (
          <span className="hero-dot h-1.5 w-10 rounded-full bg-white/35" key={slide.image} style={{ animationDelay: `${index * 6}s` }} />
        ))}
      </div>
    </section>
  );
}
