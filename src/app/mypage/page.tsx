import { MyPageClient } from "@/components/mypage/MyPageClient";
import { SectionHeader } from "@/components/common/SectionHeader";

export default function MyPage() {
  return (
    <main className="section-shell py-14">
      <SectionHeader align="left" eyebrow="My Page" title="내 예약" description="네이버 로그인 회원의 예약 내역을 확인합니다." />
      <div className="mt-8">
        <MyPageClient />
      </div>
    </main>
  );
}
