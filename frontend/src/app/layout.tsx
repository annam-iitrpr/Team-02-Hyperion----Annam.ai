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
  themeColor: "#533afd",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nibooz-whatup.vercel.app"),
  title: {
    default: "AASRA — Evidence-Based Precision Agriculture Intelligence",
    template: "%s | AASRA"
  },
  description: "Production-grade, location-aware decision support for farmers combining real weather telemetry, satellite monitoring, and deterministic agronomics. No fabricated data.",
  keywords: [
    "precision agriculture",
    "crop intelligence",
    "climate stress prediction",
    "farm advisory AI",
    "Syngenta biologicals",
    "smart farming India"
  ],
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
  openGraph: {
    title: "AASRA — Evidence-Based Precision Agriculture Intelligence",
    description: "Production-grade, location-aware decision support for farmers with real telemetry and deterministic agronomics.",
    url: "https://nibooz-whatup.vercel.app",
    siteName: "AASRA",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AASRA — Precision Agriculture Intelligence",
    description: "Location-aware decision support for farmers with real telemetry.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/images/aasra_logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
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

