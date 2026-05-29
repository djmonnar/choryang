import { seedNotices } from "@/data/seedNotices";
import type { Notice } from "@/types/notice";
import { readStorage, writeStorage } from "./storage";

const KEY = "choryang.notices";

export function listNotices(visibleOnly = false) {
  const notices = readStorage<Notice[]>(KEY, seedNotices);
  return notices
    .filter((notice) => !visibleOnly || notice.visible)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
}

export function getNotice(id: string) {
  return listNotices().find((notice) => notice.id === id) ?? null;
}

export function saveNotice(notice: Notice) {
  const notices = listNotices();
  const exists = notices.some((item) => item.id === notice.id);
  const next = exists ? notices.map((item) => (item.id === notice.id ? notice : item)) : [notice, ...notices];
  writeStorage(KEY, next);
  return notice;
}

export function deleteNotice(id: string) {
  writeStorage(
    KEY,
    listNotices().filter((notice) => notice.id !== id),
  );
}
