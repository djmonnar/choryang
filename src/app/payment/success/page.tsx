import { Suspense } from "react";
import { TossPaymentSuccessClient } from "@/components/payment/TossPaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="section-shell py-14">결제 승인 정보를 확인하고 있습니다.</div>}>
      <TossPaymentSuccessClient />
    </Suspense>
  );
}
