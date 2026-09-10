import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { FarmProvider } from "@/context/FarmContext";
import { PwaRegistration } from "@/components/PwaRegistration";
import { AuthGatekeeper } from "@/components/AuthGatekeeper";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#1b4332",
};

export const metadata: Metadata = {
  title: "AASRA — Evidence-Based Precision Agriculture Intelligence",
  description: "Production-grade, location-aware decision support for farmers combining real weather telemetry, satellite monitoring, and deterministic agronomics. No fabricated data.",
  manifest: "/manifest.json",
  applicationName: "AASRA Kisan AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AASRA",
  },
  icons: {
    icon: "/images/aasra_logo.png",
    apple: "/images/aasra_logo.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      hi: "/?lang=hi",
      mr: "/?lang=mr",
      pa: "/?lang=pa",
      gu: "/?lang=gu",
      te: "/?lang=te",
      ta: "/?lang=ta",
      kn: "/?lang=kn",
      ml: "/?lang=ml",
      bn: "/?lang=bn",
      or: "/?lang=or",
      as: "/?lang=as",
      "x-default": "/",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/images/aasra_logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://translate.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://translate.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8faf6]">
        <LanguageProvider>
          <WeatherProvider>
            <FarmProvider>
              <AuthGatekeeper>
                {children}
              </AuthGatekeeper>
              <PwaRegistration />
            </FarmProvider>
          </WeatherProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

