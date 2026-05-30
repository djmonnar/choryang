import { reservationStatusLabels, type ReservationStatus } from "@/types/reservation";

const colors: Record<ReservationStatus, string> = {
  submitted: "bg-[#f4eee0] text-[#6c4f35]",
  checking: "bg-[#eef5fb] text-[#1e7894]",
  payment_requested: "bg-[#fff3d7] text-[#7a5a10]",
  bank_waiting: "bg-[#fff3d7] text-[#7a5a10]",
  paid: "bg-[#e8f4ef] text-[#24573a]",
  confirmed: "bg-[#24573a] text-white",
  completed: "bg-[#f0f2f0] text-[#3c4439]",
  cancelled: "bg-red-50 text-red-700",
  refund_requested: "bg-purple-100 text-purple-800 ring-1 ring-purple-300",
  refunded: "bg-slate-100 text-slate-700",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={`rounded px-2 py-1 text-xs font-bold ${colors[status]}`}>{reservationStatusLabels[status]}</span>;
}
