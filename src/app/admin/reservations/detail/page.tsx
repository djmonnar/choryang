import { Suspense } from "react";
import { AdminReservationDetailClient } from "@/components/admin/AdminReservationDetailClient";

export default function AdminReservationDetailPage() {
  return (
    <Suspense fallback={<div className="section-shell py-14">예약 상세를 불러오는 중입니다.</div>}>
      <AdminReservationDetailClient />
    </Suspense>
  );
}
