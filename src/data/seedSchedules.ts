import type { Schedule } from "@/types/schedule";

const now = "2026-07-23T00:00:00.000Z";

function schedule(
  id: string,
  productId: string,
  date: string,
  startTime: string,
  endTime: string,
  capacity: number,
  memo: string,
): Schedule {
  return {
    id,
    productId,
    date,
    startTime,
    endTime,
    capacity,
    reservedCount: 0,
    status: "open",
    memo,
    createdAt: now,
    updatedAt: now,
  };
}

export const seedSchedules: Schedule[] = [
  schedule("sch-daseulgi-20260808-am", "daseulgi-fish", "2026-08-08", "10:00", "12:00", 30, "오전 물가 체험"),
  schedule("sch-daseulgi-20260808-pm", "daseulgi-fish", "2026-08-08", "14:00", "16:00", 30, "오후 물가 체험"),
  schedule("sch-hangwa-20260808-pm", "hangwa", "2026-08-08", "14:00", "15:30", 20, "전통 한과 만들기"),
  schedule("sch-acorn-rice-cake-20260808-pm", "acorn-rice-cake", "2026-08-08", "16:30", "18:00", 20, "도토리떡 만들기"),
  schedule("sch-gochujang-20260809-am", "gochujang", "2026-08-09", "10:00", "11:30", 20, "고추장 만들기"),
  schedule("sch-steamed-bread-20260809-pm", "steamed-bread", "2026-08-09", "14:00", "15:30", 20, "찐빵 만들기"),
  schedule("sch-moss-20260809-pm", "moss-ball", "2026-08-09", "16:00", "17:30", 20, "식물 만들기"),
  schedule("sch-daseulgi-20260815-am", "daseulgi-fish", "2026-08-15", "10:00", "12:00", 30, "오전 물가 체험"),
  schedule("sch-daseulgi-20260815-pm", "daseulgi-fish", "2026-08-15", "14:00", "16:00", 30, "오후 물가 체험"),
  schedule("sch-hangwa-20260815-pm", "hangwa", "2026-08-15", "14:00", "15:30", 20, "전통 한과 만들기"),
  schedule("sch-bean-room-20260808", "bean-room", "2026-08-08", "15:00", "11:00", 1, "제비콩방 1실"),
  schedule("sch-gourd-room-20260808", "gourd-room", "2026-08-08", "15:00", "11:00", 1, "조롱박방 1실"),
  schedule("sch-sword-bean-room-20260808", "sword-bean-room", "2026-08-08", "15:00", "11:00", 1, "작두콩방 1실"),
  schedule("sch-daseulyong-room-20260808", "daseulyong-room", "2026-08-08", "15:00", "11:00", 1, "다슬용방 1실"),
];
