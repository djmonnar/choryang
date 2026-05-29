import { CalendarCheck, Search } from "lucide-react";
import Link from "next/link";

export function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-[#e7decb] bg-white p-3 sm:hidden">
      <Link href="/reservation/check" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7ccb7] py-3 text-sm font-bold">
        <Search className="h-4 w-4" /> 예약조회
      </Link>
      <Link href="/reservation" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#24573a] py-3 text-sm font-bold text-white">
        <CalendarCheck className="h-4 w-4" /> 예약신청
      </Link>
    </div>
  );
}
