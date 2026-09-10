import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KrishYantra Admin Studio & Operations Hub",
  description: "Internal operations, telemetry inspection, and database control hub for KrishYantra",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
