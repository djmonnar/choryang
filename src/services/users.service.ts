import { randomUUID } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { ChoryangUser, NaverProfile } from "@/types/user";

const COLLECTION = "users";

function getUsersCollection() {
  return getAdminFirestore().collection(COLLECTION);
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

function userFromDoc(snapshot: FirebaseFirestore.DocumentSnapshot): ChoryangUser | null {
  if (!snapshot.exists) return null;
  return snapshot.data() as ChoryangUser;
}

export async function getUserById(id: string): Promise<ChoryangUser | null> {
  const snapshot = await getUsersCollection().doc(id).get();
  return userFromDoc(snapshot);
}

export async function findNaverUser(naverId: string): Promise<ChoryangUser | null> {
  const snapshot = await getUsersCollection()
    .where("provider", "==", "naver")
    .where("naverId", "==", naverId)
    .limit(1)
    .get();
  return snapshot.docs[0]?.data() as ChoryangUser | null;
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
    await getUsersCollection().doc(existing.id).set(updated, { merge: true });
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
  await getUsersCollection().doc(id).set(user);
  return user;
}

export async function markNaverUserDisconnected(naverId: string): Promise<ChoryangUser | null> {
  const existing = await findNaverUser(naverId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: ChoryangUser = {
    ...existing,
    disconnectedAt: now,
    updatedAt: now,
  };
  await getUsersCollection().doc(existing.id).set(updated, { merge: true });
  return updated;
}
