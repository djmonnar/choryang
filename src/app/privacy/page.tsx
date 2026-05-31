import { SectionHeader } from "@/components/common/SectionHeader";
import { siteSettings } from "@/data/siteSettings";

const sections = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "다슬기초량마을은 네이버 로그인 이용 시 네이버 계정에서 제공되는 이름, 이메일 주소, 휴대전화번호를 수집할 수 있습니다.",
      "체험 예약 신청 시 예약자 이름, 연락처, 이메일, 방문 날짜, 체험 상품 및 회차, 인원 정보, 요청사항, 결제 방식, 입금자명, 환불은행, 환불계좌번호, 환불 예금주, 예약 변경·취소·환불 처리 내역을 수집합니다.",
      "예약번호 조회와 고객 문의 응대를 위해 예약번호, 연락처, 예약 상태, 결제 및 환불 안내 내역을 함께 관리합니다.",
    ],
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    body: [
      "수집한 개인정보는 체험 예약 접수, 예약 가능 여부 확인, 예약 안내 연락, 예약 변경 및 취소 처리, 입금 확인, 환불 안내, 체험 운영 관련 공지 전달을 위해 사용합니다.",
      "네이버 로그인 정보는 회원 식별과 내 예약 조회, 예약 신청 시 예약자 정보 자동 입력을 위해 사용합니다.",
    ],
  },
  {
    title: "3. 보관 및 이용 기간",
    body: [
      "예약 정보는 체험 운영과 고객 응대, 분쟁 방지 및 정산 확인을 위해 필요한 기간 동안 보관한 뒤 내부 관리 기준에 따라 파기합니다.",
      "고객이 삭제 또는 정정을 요청하는 경우, 관련 법령과 정산·환불 처리에 필요한 범위를 제외하고 지체 없이 반영합니다.",
    ],
  },
  {
    title: "4. 제3자 제공 및 처리 위탁",
    body: [
      "다슬기초량마을은 고객의 개인정보를 예약 관리 목적 외로 제3자에게 제공하지 않습니다.",
      "온라인 결제가 진행되는 경우 결제 승인과 정산을 위해 결제대행사에 결제에 필요한 정보가 전달될 수 있으며, 이 경우 결제대행사의 개인정보 처리방침이 함께 적용됩니다.",
    ],
  },
  {
    title: "5. 개인정보 보호 조치",
    body: [
      "예약 정보는 관리자 확인이 필요한 업무 범위에서만 접근하며, 외부 공개 페이지에는 연락처와 계좌 정보 등 민감한 예약 정보를 노출하지 않도록 관리합니다.",
      "로그인 세션과 관리자 기능은 보안 쿠키와 서버 인증 절차를 통해 보호합니다.",
    ],
  },
  {
    title: "6. 문의처",
    body: [
      `개인정보 관련 문의는 ${siteSettings.managerName}(${siteSettings.managerPhone})에게 연락해 주세요.`,
      `주소: ${siteSettings.address}`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <section className="bg-[#eef7f5] py-16">
        <div className="section-shell">
          <SectionHeader
            align="left"
            eyebrow="Privacy"
            title="개인정보처리방침"
            description="다슬기초량마을은 체험 예약과 안내 연락에 필요한 개인정보를 최소한으로 수집하고, 예약 관리 목적에 맞게 안전하게 관리합니다."
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
