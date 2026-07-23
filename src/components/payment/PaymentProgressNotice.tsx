import { siteSettings } from "@/data/siteSettings";
import type { Reservation } from "@/types/reservation";

export function PaymentProgressNotice({ reservation }: { reservation: Reservation }) {
  if (reservation.status === "submitted") {
    return (
      <p className="mt-4 rounded-md bg-[#f8f1e3] px-4 py-3 text-sm leading-6 text-[#5d665e]">
        예약이 접수되었습니다. 사무장님이 날짜와 체험 가능 여부를 확인한 뒤 결제를 안내합니다.
      </p>
    );
  }

  if (reservation.status === "checking") {
    return (
      <p className="mt-4 rounded-md bg-[#eef7f5] px-4 py-3 text-sm leading-6 text-[#315e61]">
        사무장님이 예약 가능 여부를 확인하고 있습니다. 아직 결제하지 않으셔도 됩니다.
      </p>
    );
  }

  if (reservation.status === "bank_waiting" && reservation.paymentMethod === "bank_transfer") {
    return (
      <div className="mt-4 rounded-md border border-[#e0c98e] bg-[#fff9e8] px-4 py-3 text-sm leading-6 text-[#66501d]">
        <p className="font-bold">예약 가능 확인이 완료되었습니다. 아래 계좌로 입금해 주세요.</p>
        <p className="mt-1 text-base font-bold text-[#24573a]">
          {siteSettings.bankName} {siteSettings.bankAccount} ({siteSettings.bankHolder})
        </p>
        <p className="mt-1">입금 확인 후 예약확정으로 변경됩니다.</p>
      </div>
    );
  }

  if (reservation.status === "payment_requested" && reservation.paymentMethod === "online") {
    return (
      <p className="mt-4 rounded-md bg-[#eef7f5] px-4 py-3 text-sm leading-6 text-[#315e61]">
        예약 가능 확인이 완료되었습니다. 아래 온라인결제 버튼으로 결제를 마치면 예약이 바로 확정됩니다.
      </p>
    );
  }

  if (reservation.status === "paid") {
    return (
      <p className="mt-4 rounded-md bg-[#edf7f1] px-4 py-3 text-sm font-semibold leading-6 text-[#24573a]">
        결제는 확인되었습니다. 예약확정 상태로 전환 중입니다.
      </p>
    );
  }

  if (reservation.status === "confirmed") {
    return (
      <p className="mt-4 rounded-md bg-[#edf7f1] px-4 py-3 text-sm font-semibold leading-6 text-[#24573a]">
        결제 확인이 완료되어 예약이 최종 확정되었습니다.
      </p>
    );
  }

  return null;
}
