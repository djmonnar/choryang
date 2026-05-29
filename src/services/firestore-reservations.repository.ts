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
    const scheduleRef = doc(db, "schedules", input.scheduleId);
    const scheduleSnap = await transaction.get(scheduleRef);
    if (!scheduleSnap.exists()) throw new Error("선택한 회차를 찾을 수 없습니다.");
    const schedule = scheduleSnap.data() as { capacity: number; reservedCount: number; status: string };
    const totalPeople = input.adultCount + input.youthCount + input.childCount;
    if (schedule.status !== "open") throw new Error("예약 가능한 회차가 아닙니다.");
    if (schedule.reservedCount + totalPeople > schedule.capacity) throw new Error("남은 정원을 초과했습니다.");

    const productSnap = await getDoc(doc(db, "products", input.productId));
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
