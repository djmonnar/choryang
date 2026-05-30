import { Suspense } from "react";
import { MyPageClient } from "@/components/mypage/MyPageClient";
import { SectionHeader } from "@/components/common/SectionHeader";

export default function MyPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="My Page" title="내 정보/예약" description="네이버 로그인 회원정보와 예약 내역을 확인합니다." />
      <div className="mt-8">
        <Suspense fallback={<p className="rounded-lg border border-[#e4d9c5] bg-white p-6 shadow-sm">회원 정보를 확인하고 있습니다.</p>}>
          <MyPageClient />
        </Suspense>
      </div>
    </main>
  );
}
