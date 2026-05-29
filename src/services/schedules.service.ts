import { seedSchedules } from "@/data/seedSchedules";
import type { Schedule } from "@/types/schedule";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.schedules";

export function listSchedules(productId?: string) {
  const schedules = readStorage<Schedule[]>(KEY, seedSchedules);
  return schedules
    .filter((schedule) => !productId || schedule.productId === productId)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

export function getSchedule(id: string) {
  return listSchedules().find((schedule) => schedule.id === id) ?? null;
}

export function saveSchedule(schedule: Schedule) {
  const schedules = listSchedules();
  const exists = schedules.some((item) => item.id === schedule.id);
  const next = exists ? schedules.map((item) => (item.id === schedule.id ? schedule : item)) : [...schedules, schedule];
  writeStorage(KEY, next);
  return schedule;
}

export function reserveCapacity(scheduleId: string, people: number) {
  const schedules = listSchedules();
  const schedule = schedules.find((item) => item.id === scheduleId);
  if (!schedule) throw new Error("선택한 회차를 찾을 수 없습니다.");
  if (schedule.status !== "open") throw new Error("예약 가능한 회차가 아닙니다.");
  if (schedule.reservedCount + people > schedule.capacity) throw new Error("남은 정원을 초과했습니다.");
  const nextSchedule: Schedule = {
    ...schedule,
    reservedCount: schedule.reservedCount + people,
    status: schedule.reservedCount + people >= schedule.capacity ? "full" : schedule.status,
    updatedAt: new Date().toISOString(),
  };
  writeStorage(
    KEY,
    schedules.map((item) => (item.id === scheduleId ? nextSchedule : item)),
  );
  return nextSchedule;
}
