import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBookingBar } from "@/components/layout/MobileBookingBar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://choryang.vercel.app";
const ogImagePath = "/images/choryang/kakao-og-thumbnail.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "다슬기초량마을 | 사천 초량강 체험 예약",
    template: "%s | 다슬기초량마을",
  },
  description:
    "사천 초량강에서 다슬기잡이, 물고기잡이, 만들기 체험, 시골밥상까지 함께하는 다슬기초량마을 체험 예약 홈페이지입니다.",
  icons: {
    icon: "/images/choryang/choryang-cute-icon.png",
    apple: "/images/choryang/choryang-cute-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "다슬기초량마을",
    title: "다슬기초량마을 | 사천 초량강 체험 예약",
    description: "다슬기잡이, 물고기잡이, 만들기 체험을 예약할 수 있는 사천 농촌체험휴양마을입니다.",
    images: [
      {
        url: ogImagePath,
        width: 1731,
        height: 909,
        alt: "다슬기초량마을 초량강 자연체험 예약",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "다슬기초량마을 | 사천 초량강 체험 예약",
    description: "사천 초량강에서 만나는 다슬기초량마을 자연체험 예약",
    images: [ogImagePath],
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
