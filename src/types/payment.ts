export type PaymentStatus = "requested" | "bank_waiting" | "paid" | "cancelled" | "refund_requested" | "refunded" | "failed";
export type PaymentProviderName = "mock" | "portone" | "toss" | "bank";

export interface Payment {
  id: string;
  reservationId: string;
  method: "bank_transfer" | "online";
  provider: PaymentProviderName;
  amount: number;
  status: PaymentStatus;
  requestedAt: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  transactionId?: string | null;
  virtualAccountInfo?: string | null;
  memo?: string;
}

export interface PaymentRequestInput {
  reservationId: string;
  reservationNumber: string;
  amount: number;
  customerName: string;
  phone: string;
}

export interface PaymentRequestResult {
  paymentId: string;
  provider: PaymentProviderName;
  status: PaymentStatus;
  redirectUrl?: string;
}

export interface PaymentVerifyResult {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
}

export interface PaymentCancelInput {
  paymentId: string;
  reason: string;
}

export interface PaymentCancelResult {
  paymentId: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  requestPayment(input: PaymentRequestInput): Promise<PaymentRequestResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerifyResult>;
  cancelPayment(input: PaymentCancelInput): Promise<PaymentCancelResult>;
}
