import type { SiteSettings } from "@/types/site";

export const managerPhone = "010-9280-2336";

export const siteSettings: SiteSettings = {
  managerName: "김노미 사무장님",
  managerPhone,
  address: "경상남도 사천시 곤명면 초량길 27-3",
  bankName: "은행명 입력",
  bankAccount: "계좌번호 입력",
  bankHolder: "예금주 입력",
  reservationGuide:
    "예약 신청이 접수되었습니다. 김노미 사무장님이 가능 여부를 확인한 후 결제 안내를 드립니다. 예약은 입금 또는 온라인결제 확인 후 최종 확정됩니다.",
  refundGuide: "환불 규정은 운영 정책 확정 후 관리자 설정에서 수정해 주세요.",
  privacyPolicy:
    "예약 접수 및 안내 연락을 위해 이름, 연락처, 예약 정보를 수집합니다. 수집된 정보는 예약 관리 목적 외에는 사용하지 않으며, 체험 종료 후 내부 보관 기준에 따라 관리됩니다.",
};

export const reservationCautions = [
  "체험은 계절, 날씨, 마을 사정에 따라 변경 또는 취소될 수 있습니다.",
  "예약은 관리자 확인 후 최종 확정됩니다.",
  "입금 또는 온라인결제 확인 후 예약이 확정됩니다.",
  "물가 체험은 안전을 위해 보호자의 동행이 필요할 수 있습니다.",
  "단체 예약은 사전 문의가 필요합니다.",
];
