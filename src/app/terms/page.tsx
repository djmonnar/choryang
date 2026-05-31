import { SectionHeader } from "@/components/common/SectionHeader";
import { siteSettings } from "@/data/siteSettings";

const sections = [
  {
    title: "1. 목적",
    body: [
      "이 약관은 다슬기초량마을 체험 예약 홈페이지에서 제공하는 체험 예약 신청, 예약 조회, 결제 안내, 취소 및 환불 요청 서비스 이용에 필요한 사항을 정합니다.",
    ],
  },
  {
    title: "2. 예약 신청과 확정",
    body: [
      "고객은 홈페이지에서 방문 날짜, 체험 회차, 인원, 예약자 정보를 입력하여 체험 예약을 신청할 수 있습니다.",
      "예약 신청은 즉시 확정이 아니며, 마을 운영자가 체험 가능 여부와 회차 정원을 확인한 뒤 결제 안내 또는 예약 확정 절차를 진행합니다.",
      "예약은 계좌입금 또는 온라인결제 확인 후 최종 확정됩니다.",
    ],
  },
  {
    title: "3. 결제와 계좌입금",
    body: [
      `계좌입금 예약의 입금 계좌는 ${siteSettings.bankName} ${siteSettings.bankAccount} (${siteSettings.bankHolder})입니다.`,
      "입금자명과 예약자명이 다른 경우 확인이 지연될 수 있으므로 예약 신청 시 입금자명을 정확히 입력해야 합니다.",
      "온라인결제는 관리자 결제 요청 후 고객의 내 예약 또는 예약조회 화면에서 진행할 수 있습니다.",
    ],
  },
  {
    title: "4. 예약 변경 및 체험 운영",
    body: [
      "체험은 계절, 날씨, 하천 수위, 마을 사정, 안전 상황에 따라 일정, 회차, 진행 내용이 변경되거나 취소될 수 있습니다.",
      "물가 체험은 안전을 위해 보호자 동행 또는 현장 안내에 따른 참여 제한이 있을 수 있습니다.",
      "단체 예약은 인원, 식사, 차량 동선, 체험 가능 시간을 사전에 상담한 뒤 진행합니다.",
    ],
  },
  {
    title: "5. 취소 및 환불",
    body: [
      "예약신청, 관리자확인중, 결제요청, 입금대기 상태의 예약은 고객이 홈페이지에서 취소 요청할 수 있으며, 취소 시 해당 회차의 예약 가능 인원이 복구됩니다.",
      "결제완료 또는 예약확정 상태의 예약은 환불 요청으로 접수되며, 운영자가 결제 내역과 체험 일정, 환불 계좌 정보를 확인한 뒤 환불 가능 여부와 방법을 안내합니다.",
      "체험완료, 예약취소, 환불완료 상태의 예약은 홈페이지에서 추가 취소 요청을 할 수 없습니다.",
    ],
  },
  {
    title: "6. 이용자의 책임",
    body: [
      "고객은 예약 신청 시 정확한 이름, 연락처, 인원, 환불계좌 정보를 입력해야 하며, 잘못 입력된 정보로 발생하는 안내 지연이나 환불 지연에 대해 확인 요청을 받을 수 있습니다.",
      "고객은 현장 안전 안내와 체험 진행자의 지시에 따라야 하며, 안전 수칙을 따르지 않을 경우 체험 참여가 제한될 수 있습니다.",
    ],
  },
  {
    title: "7. 운영자 정보",
    body: [
      "서비스명: 다슬기초량마을 체험 예약 홈페이지",
      `운영 장소: ${siteSettings.address}`,
      `예약 및 이용 문의: ${siteSettings.managerName} ${siteSettings.managerPhone}`,
      "사업자 및 통신판매 관련 세부 정보는 마을 운영 정보 정비 후 홈페이지에 순차적으로 안내합니다.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main>
      <section className="bg-[#f8f1e3] py-16">
        <div className="section-shell">
          <SectionHeader
            align="left"
            eyebrow="Terms"
            title="이용약관"
            description="다슬기초량마을 체험 예약 홈페이지 이용과 예약 신청, 결제, 취소 및 환불 요청에 관한 기본 약관입니다."
          />
        </div>
      </section>
      <section className="section-shell py-12">
        <div className="grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#24573a]">{section.title}</h2>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-[#4f5d55]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
