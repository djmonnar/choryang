import type {
  PaymentCancelInput,
  PaymentCancelResult,
  PaymentProvider,
  PaymentProviderName,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyResult,
} from "@/types/payment";

export class MockPaymentProvider implements PaymentProvider {
  async requestPayment(input: PaymentRequestInput): Promise<PaymentRequestResult> {
    return {
      paymentId: `mock_${input.reservationNumber}_${Date.now()}`,
      provider: "mock",
      status: "requested",
      redirectUrl: `/reservation/complete?reservationNumber=${input.reservationNumber}`,
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerifyResult> {
    return { paymentId, status: "paid", amount: 0 };
  }

  async cancelPayment(input: PaymentCancelInput): Promise<PaymentCancelResult> {
    return { paymentId: input.paymentId, status: "cancelled" };
  }
}

export class PortOnePaymentProvider extends MockPaymentProvider {
  async requestPayment(): Promise<PaymentRequestResult> {
    throw new Error("PortOne 연동은 운영키 설정 후 구현하세요.");
  }
}

export class TossPaymentProvider extends MockPaymentProvider {
  async requestPayment(): Promise<PaymentRequestResult> {
    throw new Error("TossPayments 연동은 운영키 설정 후 구현하세요.");
  }
}

export function getPaymentProvider(provider: PaymentProviderName = "mock"): PaymentProvider {
  if (provider === "portone") return new PortOnePaymentProvider();
  if (provider === "toss") return new TossPaymentProvider();
  return new MockPaymentProvider();
}
