import { collection, doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirebaseServices } from "@/lib/firebase/client";
import type { ReservationInput } from "@/types/reservation";

export async function createReservationWithFirestoreTransaction(input: ReservationInput) {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error("Firebase 환경변수가 설정되지 않았습니다. mock repository를 사용하거나 .env.local을 확인하세요.");
  }

  const { db } = services;
  return runTransaction(db, async (transaction) => {
    const firstItem = input.items?.[0];
    const scheduleId = firstItem?.scheduleId ?? input.scheduleId;
    const productId = firstItem?.productId ?? input.productId;
    const adultCount = firstItem?.adultCount ?? input.adultCount ?? 0;
    const youthCount = firstItem?.youthCount ?? input.youthCount ?? 0;
    const childCount = firstItem?.childCount ?? input.childCount ?? 0;
    const preschoolCount = firstItem?.preschoolCount ?? input.preschoolCount ?? 0;
    if (!scheduleId || !productId) throw new Error("선택한 체험과 회차 정보가 필요합니다.");

    const scheduleRef = doc(db, "schedules", scheduleId);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) throw new Error("선택한 회차를 찾을 수 없습니다.");
    const schedule = scheduleSnap.data() as { capacity: number; reservedCount: number; status: string };
    const totalPeople = adultCount + youthCount + childCount + preschoolCount;
    if (schedule.status !== "open") throw new Error("예약 가능한 회차가 아닙니다.");
    if (schedule.reservedCount + totalPeople > schedule.capacity) throw new Error("남은 정원을 초과했습니다.");

    const productSnap = await getDoc(doc(db, "products", productId));
    if (!productSnap.exists()) throw new Error("상품을 찾을 수 없습니다.");

    const reservationRef = doc(collection(db, "reservations"));
    transaction.update(scheduleRef, {
      reservedCount: schedule.reservedCount + totalPeople,
      status: schedule.reservedCount + totalPeople >= schedule.capacity ? "full" : schedule.status,
      updatedAt: serverTimestamp(),
    });
    transaction.set(reservationRef, {
      ...input,
      totalPeople,
      status: "submitted",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return reservationRef.id;
  });
}
