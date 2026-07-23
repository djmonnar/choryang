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
export type ReservationCancelActor = "customer" | "admin";

export interface ReservationItem {
  productId: string;
  productName: string;
  scheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
  adultCount: number;
  youthCount: number;
  childCount: number;
  preschoolCount?: number;
  totalPeople: number;
  reservedUnits?: number;
  priceOptionId?: string;
  priceOptionLabel?: string;
  unitPrice?: number;
  amount: number | null;
}

export interface ReservationItemInput {
  productId: string;
  scheduleId: string;
  adultCount: number;
  youthCount: number;
  childCount: number;
  preschoolCount?: number;
  priceOptionId?: string;
  productName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  totalPeople?: number;
  amount?: number | null;
}

export interface Reservation {
  id: string;
  userId?: string;
  reservationNumber: string;
  items?: ReservationItem[];
  productId: string;
  productName: string;
  scheduleId: string;
  date: string;
  startTime: string;
  visitDate?: string;
  customerName: string;
  phone: string;
  email?: string;
  adultCount: number;
  youthCount: number;
  childCount: number;
  preschoolCount?: number;
  totalPeople: number;
  totalAmount: number | null;
  paymentMethod: PaymentMethod;
  status: ReservationStatus;
  paymentRequestId?: string;
  paymentRequestedAt?: string;
  confirmedAt?: string;
  depositorName?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  requestMemo?: string;
  adminMemo?: string;
  cancelReason?: string;
  cancelledAt?: string | null;
  cancelledBy?: ReservationCancelActor | null;
  refundedAt?: string | null;
  capacityRestored?: boolean;
  privacyAgreed: boolean;
  cautionAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationInput {
  items?: ReservationItemInput[];
  productId?: string;
  productName?: string;
  scheduleId?: string;
  date?: string;
  startTime?: string;
  customerName: string;
  phone: string;
  email?: string;
  adultCount?: number;
  youthCount?: number;
  childCount?: number;
  preschoolCount?: number;
  paymentMethod: PaymentMethod;
  depositorName?: string;
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountHolder?: string;
  requestMemo?: string;
  adminMemo?: string;
  privacyAgreed: boolean;
  cautionAgreed: boolean;
}

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
