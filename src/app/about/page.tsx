import { SectionHeader } from "@/components/common/SectionHeader";

export default function AboutPage() {
  return (
    <main>
      <section className="bg-[#eef7f5] py-16">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader
            align="left"
            eyebrow="About"
            title="초량강 곁에서 자연을 배우는 다슬기초량마을"
            description="경남 사천시 곤명면 초량길 27-3에 자리한 다슬기초량마을은 초량강과 곤양천의 물길, 다슬기와 민물고기, 농촌의 계절을 가까이 만나는 체험마을입니다."
          />
          <img src="/images/hero-village.jpg" alt="다슬기초량마을 전경" className="h-80 w-full rounded-lg object-cover shadow-sm" />
        </div>
      </section>
      <section className="section-shell grid gap-5 py-14 md:grid-cols-3">
        {[
          ["가족 체험", "아이와 보호자가 함께 물가와 농촌을 경험하는 하루 코스로 적합합니다."],
          ["어린이집·학교", "생태 관찰, 만들기, 수확 활동을 단체 일정에 맞춰 상담할 수 있습니다."],
          ["단체 프로그램", "인원, 식사, 차량 동선을 고려한 사전 상담 후 예약을 확정합니다."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#24573a]">{title}</h2>
            <p className="mt-3 leading-7 text-[#5d665e]">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
