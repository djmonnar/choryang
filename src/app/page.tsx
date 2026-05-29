import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardList, CreditCard, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { Hero } from "@/components/home/Hero";
import { SectionHeader } from "@/components/common/SectionHeader";
import { seedProducts } from "@/data/seedProducts";
import { managerPhone, siteSettings } from "@/data/siteSettings";
import { withBasePath } from "@/lib/utils/publicPath";

const featured = seedProducts.filter((product) => product.bookingEnabled).slice(0, 4);

const steps = [
  { title: "예약 신청", icon: ClipboardList },
  { title: "사무장 확인", icon: Users },
  { title: "결제 안내", icon: CreditCard },
  { title: "입금/결제 확인", icon: ShieldCheck },
  { title: "예약 확정", icon: CheckCircle2 },
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="border-y border-[#e6dcc9] bg-white/75 py-5">
        <div className="section-shell grid gap-4 md:grid-cols-4">
          {[
            ["청정 1급수 초량강", "맑은 물가에서 자연을 온몸으로 느껴보세요."],
            ["가족·단체 체험", "어린이집, 학교, 모임 단체까지 함께하기 좋습니다."],
            ["숙박·식사 안내", "숙박과 시골밥상은 문의 중심으로 안내드립니다."],
            ["관리자 확인 후 확정", "가능 여부와 결제 확인 후 예약이 확정됩니다."],
          ].map(([title, text]) => (
            <div className="flex gap-3 border-[#e7decb] md:border-r md:pr-5 last:md:border-r-0" key={title}>
              <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#24573a]" aria-hidden />
              <div>
                <p className="font-semibold text-[#203326]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#5e665d]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-12 sm:py-16" id="experiences">
        <SectionHeader
          eyebrow="Experience"
          title="대표 체험 4가지"
          description="초량강 물가 체험부터 손으로 만드는 먹거리 체험까지, 실제 예약 가능한 프로그램을 먼저 확인해보세요."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ExperienceCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>

      <section className="bg-[#eef7f5] py-12 sm:py-16">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeader
            align="left"
            eyebrow="Season"
            title="계절마다 달라지는 초량마을"
            description="봄에는 쑥떡과 모내기, 여름에는 다슬기와 물놀이, 가을에는 도토리와 알밤처럼 계절의 리듬에 맞춘 체험을 운영합니다."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["봄", "쑥떡 만들기, 모내기, 딸기따기"],
              ["여름", "다슬기잡이, 물고기잡이, 블루베리쨈"],
              ["가을", "알밤체험, 도토리묵, 벼 탈곡"],
              ["연중", "한과, 찐빵, 샌드위치, 힐링 체험"],
            ].map(([season, text]) => (
              <div className="rounded-lg border border-[#d6e7e1] bg-white p-5 shadow-sm" key={season}>
                <p className="text-lg font-bold text-[#24573a]">{season}</p>
                <p className="mt-2 text-sm leading-6 text-[#4f5d55]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-12 sm:py-16">
        <SectionHeader eyebrow="Booking" title="예약은 이렇게 진행됩니다" description="예약은 즉시 확정이 아니라, 마을 운영 가능 여부를 확인한 뒤 최종 확정됩니다." />
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="relative rounded-lg border border-[#e4d9c5] bg-white p-5 text-center shadow-sm" key={step.title}>
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#82775a] text-sm font-bold text-white">{index + 1}</span>
                <Icon className="mx-auto mt-4 h-8 w-8 text-[#24573a]" aria-hidden />
                <p className="mt-3 font-semibold">{step.title}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-center text-sm text-[#6d6351]">현재 결제 방식: 계좌입금 / 추후 PG 온라인결제 연동 예정</p>
      </section>

      <section className="border-y border-[#e7decb] bg-white py-12 sm:py-16">
        <div className="section-shell grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-lg border border-[#e4d9c5] shadow-sm">
            <img src={withBasePath("/images/choryang/stay-01.jpg")} alt="초량마을 숙박 안내" className="h-56 w-full object-cover" />
            <div className="p-6">
              <p className="text-xl font-bold">숙박 안내</p>
              <p className="mt-2 text-sm leading-6 text-[#596258]">숙박은 별도 예약 기능 없이 문의 중심으로 안내드립니다.</p>
              <Link href="/stay-food" className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#24573a] px-4 py-2 text-sm font-semibold text-[#24573a]">
                자세히 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
          <article className="overflow-hidden rounded-lg border border-[#e4d9c5] shadow-sm">
            <img src={withBasePath("/images/choryang/food-table-01.jpg")} alt="초량마을 시골밥상" className="h-56 w-full object-cover" />
            <div className="p-6">
              <p className="text-xl font-bold">식사 안내</p>
              <p className="mt-2 text-sm leading-6 text-[#596258]">자연밥상, 다슬기탕, 도토리묵밥 등은 문의 후 안내드립니다.</p>
              <Link href="/stay-food" className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#24573a] px-4 py-2 text-sm font-semibold text-[#24573a]">
                자세히 보기 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section-shell py-12 sm:py-16">
        <SectionHeader eyebrow="Village" title="마을 사진 갤러리" description="초량마을의 물길과 마을 풍경을 사진으로 둘러보세요." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "/images/choryang/village-view-01.jpg",
            "/images/choryang/village-entrance-01.jpg",
            "/images/choryang/education-center-01.jpg",
          ].map((src) => (
            <img key={src} src={withBasePath(src)} alt="다슬기초량마을 갤러리" className="h-64 w-full rounded-lg object-cover shadow-sm" />
          ))}
        </div>
      </section>

      <section className="bg-[#f8f1e3] py-12 sm:py-16">
        <div className="section-shell grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <SectionHeader align="left" eyebrow="Nearby" title="주변 여행지와 함께" description="사천과 곤명면 여행길에 하루 체험 코스로 들르기 좋습니다." />
          </div>
          {["초량강 물길 산책", "곤양천 생태 관찰", "사천 가족 여행 코스"].map((item) => (
            <div className="rounded-lg bg-white p-6 shadow-sm" key={item}>
              <p className="font-bold text-[#24573a]">{item}</p>
              <p className="mt-2 text-sm leading-6 text-[#5e665d]">체험 일정과 이동 시간을 고려해 단체 방문 전 문의해 주세요.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell py-12 sm:py-16" id="contact">
        <div className="grid overflow-hidden rounded-lg border border-[#e4d9c5] bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e7894] sm:text-sm sm:tracking-[0.2em]">Contact</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">문의 및 예약 상담</h2>
            <div className="mt-6 space-y-3 text-[#4c584f]">
              <p className="flex items-start gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#24573a]" /> <span>{siteSettings.managerName} {managerPhone}</span></p>
              <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#24573a]" /> <span>{siteSettings.address}</span></p>
            </div>
            <Link href="/reservation" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#24573a] px-5 py-3 font-semibold text-white shadow-sm">
              <CalendarCheck className="h-5 w-5" /> 예약 신청하기
            </Link>
          </div>
          <div className="min-h-72 bg-[#dcebe7] p-6">
            <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-[#8db9ad] bg-white/70 text-center">
              <div>
                <MapPin className="mx-auto h-10 w-10 text-[#1e7894]" />
                <p className="mt-3 font-bold">지도 영역 placeholder</p>
                <p className="mt-1 text-sm text-[#5f6a63]">실서비스에서는 Naver/Kakao 지도 API로 교체</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
