import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { randomUUID } from "node:crypto";
import { getFirestoreDb } from "@/lib/firebase/firestore";
import type { ChoryangUser, NaverProfile } from "@/types/user";

const COLLECTION = "users";

function getUsersCollection() {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firebase 환경변수가 설정되지 않아 users 컬렉션에 접근할 수 없습니다.");
  }
  return collection(db, COLLECTION);
}

function profileToUserFields(profile: NaverProfile) {
  return {
    name: profile.name ?? "",
    nickname: profile.nickname ?? "",
    email: profile.email ?? "",
    mobile: profile.mobile ?? "",
    profileImage: profile.profile_image ?? "",
  };
}

export async function getUserById(id: string): Promise<ChoryangUser | null> {
  const snapshot = await getDoc(doc(getUsersCollection(), id));
  if (!snapshot.exists()) return null;
  return snapshot.data() as ChoryangUser;
}

export async function findNaverUser(naverId: string): Promise<ChoryangUser | null> {
  const snapshot = await getDocs(query(getUsersCollection(), where("provider", "==", "naver"), where("naverId", "==", naverId), limit(1)));
  const found = snapshot.docs[0];
  return found ? (found.data() as ChoryangUser) : null;
}

export async function upsertNaverUser(profile: NaverProfile): Promise<ChoryangUser> {
  const now = new Date().toISOString();
  const existing = await findNaverUser(profile.id);
  const profileFields = profileToUserFields(profile);

  if (existing) {
    const updated: ChoryangUser = {
      ...existing,
      ...profileFields,
      updatedAt: now,
      lastLoginAt: now,
    };
    await setDoc(doc(getUsersCollection(), existing.id), updated, { merge: true });
    return updated;
  }

  const id = randomUUID();
  const user: ChoryangUser = {
    id,
    provider: "naver",
    naverId: profile.id,
    ...profileFields,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };
  await setDoc(doc(getUsersCollection(), id), user);
  return user;
}
