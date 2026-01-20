import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fafaf9",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aifashion.pro"),
  title: {
    default: "AI Fashion - 智能模特换装平台 | AI虚拟试衣",
    template: "%s | AI Fashion",
  },
  description: "AI-powered virtual try-on platform. Transform your fashion experience with cutting-edge technology. Upload clothing photos and generate high-quality model images instantly.",
  keywords: [
    "AI换装",
    "虚拟试衣",
    "AI模特",
    "时尚科技",
    "AI fashion",
    "virtual try-on",
    "AI model",
    "服装展示",
    "电商模特",
    "AI图像生成",
  ],
  authors: [{ name: "AI Fashion Team" }],
  creator: "AI Fashion",
  publisher: "AI Fashion",
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
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://aifashion.pro",
    siteName: "AI Fashion",
    title: "AI Fashion - 智能模特换装平台 | AI虚拟试衣",
    description: "AI-powered virtual try-on platform. Transform your fashion experience with cutting-edge technology.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Fashion - 智能模特换装平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Fashion - 智能模特换装平台",
    description: "AI-powered virtual try-on platform. Transform your fashion experience.",
    images: ["/og-image.jpg"],
    creator: "@aifashion",
  },
  alternates: {
    canonical: "https://aifashion.pro",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth color-scheme:light dark" style={{ colorScheme: 'light dark' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
