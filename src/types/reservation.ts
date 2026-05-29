export type ReservationStatus =
  | "submitted"
  | "checking"
  | "payment_requested"
  | "bank_waiting"
  | "paid"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded";

export type PaymentMethod = "bank_transfer" | "online";

export interface Reservation {
  id: string;
  reservationNumber: string;
  productId: string;
  productName: string;
  scheduleId: string;
  date: string;
  startTime: string;
  customerName: string;
  phone: string;
  email?: string;
  adultCount: number;
  youthCount: number;
  childCount: number;
  totalPeople: number;
  totalAmount: number | null;
  paymentMethod: PaymentMethod;
  status: ReservationStatus;
  requestMemo?: string;
  adminMemo?: string;
  privacyAgreed: boolean;
  cautionAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReservationInput = Omit<
  Reservation,
  "id" | "reservationNumber" | "status" | "createdAt" | "updatedAt" | "totalPeople" | "totalAmount"
>;

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  submitted: "예약신청",
  checking: "관리자확인중",
  payment_requested: "결제요청",
  bank_waiting: "입금대기",
  paid: "결제완료",
  confirmed: "예약확정",
  completed: "체험완료",
  cancelled: "예약취소",
  refund_requested: "환불요청",
  refunded: "환불완료",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "계좌입금",
  online: "온라인결제",
};
