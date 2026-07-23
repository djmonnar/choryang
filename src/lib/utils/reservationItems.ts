import type { Reservation, ReservationItem } from "@/types/reservation";

export function getReservationItems(reservation: Reservation): ReservationItem[] {
  if (reservation.items?.length) return reservation.items;

  return [
    {
      productId: reservation.productId,
      productName: reservation.productName,
      scheduleId: reservation.scheduleId,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: "",
      adultCount: reservation.adultCount,
      youthCount: reservation.youthCount,
      childCount: reservation.childCount,
      preschoolCount: reservation.preschoolCount ?? 0,
      totalPeople: reservation.totalPeople,
      reservedUnits: reservation.totalPeople,
      amount: reservation.totalAmount,
    },
  ];
}

export function getReservationTitle(reservation: Reservation) {
  const items = getReservationItems(reservation);
  if (items.length === 1) return items[0]?.productName ?? reservation.productName;
  return `${items[0]?.productName ?? reservation.productName} 외 ${items.length - 1}개`;
}

export function formatReservationItemTime(item: ReservationItem) {
  return `${item.date} ${item.startTime}${item.endTime ? `~${item.endTime}` : ""}`;
}
