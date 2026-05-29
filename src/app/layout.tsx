import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBookingBar } from "@/components/layout/MobileBookingBar";

export const metadata: Metadata = {
  title: "다슬기초량마을 | 사천 초량강 체험 예약",
  description:
    "사천 초량강에서 다슬기잡이, 물고기잡이, 만들기 체험, 시골밥상을 만나는 다슬기초량마을 예약 홈페이지입니다.",
  icons: {
    icon: "/images/choryang/choryang-cute-icon.png",
    apple: "/images/choryang/choryang-cute-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <MobileBookingBar />
      </body>
    </html>
  );
}
