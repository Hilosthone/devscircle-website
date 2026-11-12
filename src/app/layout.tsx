import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://devscircleacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description:
    "Learn practical tech skills from expert tutors, build real projects, and earn a verifiable certificate in three months with a 90% scholarship.",
  icons: {
    icon: "/DevsCircle-Logo.png",
    shortcut: "/DevsCircle-Logo.png",
    apple: "/DevsCircle-Logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — 90% Tech Scholarship`,
    description:
      "Build practical tech skills with live classes, real projects, and an online verifiable certificate. Pay only 10%, capped at ₦10,000.",
    images: [
      {
        url: "/DevsCircle-Logo.png",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — 90% Tech Scholarship`,
    description:
      "Build practical tech skills with live classes, real projects, and an online verifiable certificate.",
    images: ["/DevsCircle-Logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}