export type ScheduleStatus = "open" | "closed" | "full" | "cancelled";

export interface Schedule {
  id: string;
  productId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservedCount: number;
  status: ScheduleStatus;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export const scheduleStatusLabels: Record<ScheduleStatus, string> = {
  open: "예약가능",
  closed: "마감",
  full: "정원마감",
  cancelled: "운영취소",
};
