import type { Notice } from "@/types/notice";

export const seedNotices: Notice[] = [
  {
    id: "notice-2026-summer",
    title: "2026년 여름 물가 체험 예약 안내",
    content:
      "다슬기잡이 및 물고기잡이 체험은 날씨와 수위에 따라 운영 시간이 변경될 수 있습니다. 아쿠아슈즈, 수건, 여벌옷을 준비해 주세요.",
    visible: true,
    pinned: true,
    createdAt: "2026-05-29T00:00:00.000Z",
    updatedAt: "2026-05-29T00:00:00.000Z",
  },
  {
    id: "notice-group",
    title: "어린이집·학교·단체 예약은 사전 문의 부탁드립니다",
    content: "단체 체험은 인원, 차량, 식사 여부에 따라 운영 준비가 달라집니다. 예약 신청 전 전화 상담을 권장합니다.",
    visible: true,
    pinned: false,
    createdAt: "2026-05-29T00:00:00.000Z",
    updatedAt: "2026-05-29T00:00:00.000Z",
  },
];
