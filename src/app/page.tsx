// src/app/page.tsx
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { HomeContent } from "@/features/landing/components/HomeContent";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://devscircleacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-orange-500/30 selection:text-orange-200">
      <Navbar />
      <HomeContent />
      <Footer />
    </div>
  );
}