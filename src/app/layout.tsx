import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/layout/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Alopedia — AI 두피 분석",
    template: "%s | Alopedia",
  },
  description:
    "사진 한 장으로 AI가 두피 상태를 분석합니다. 노우드-해밀턴 스케일 기반 5단계 분석, 변화 추적, 익명 커뮤니티.",
  keywords: [
    "탈모",
    "두피 분석",
    "AI 두피",
    "노우드 해밀턴",
    "탈모 진단",
    "두피 관리",
    "탈모 커뮤니티",
    "Alopedia",
  ],
  authors: [{ name: "Alopedia" }],
  creator: "Alopedia",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "Alopedia",
    title: "Alopedia — AI 두피 분석",
    description:
      "사진 한 장으로 AI가 두피 상태를 분석합니다. 변화를 추적하고, 같은 고민을 가진 사람들과 경험을 나눠보세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alopedia — AI 두피 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alopedia — AI 두피 분석",
    description:
      "사진 한 장으로 AI가 두피 상태를 분석합니다. 변화를 추적하고, 같은 고민을 가진 사람들과 경험을 나눠보세요.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Alopedia",
    description:
      "사진 한 장으로 AI가 두피 상태를 분석합니다. 노우드-해밀턴 스케일 기반 5단계 분석, 변화 추적, 익명 커뮤니티.",
    url: SITE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: "ko",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
