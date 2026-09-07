import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Fields & GIS Farm Registry | AASRA Precision Agriculture",
  description:
    "Manage your registered farm parcels, draw interactive satellite GIS boundaries, configure ICAR regional soil parameters, and synchronize crop agronomics across the AASRA platform.",
  keywords: [
    "Precision Agriculture",
    "GIS Farm Boundary",
    "Satellite Field Plotter",
    "ICAR Soil Intelligence",
    "Syngenta CropFit",
    "AASRA Farm Management",
    "Farm Crop Switcher",
    "Indian Agriculture GIS",
  ],
  alternates: {
    canonical: "http://localhost:3000/fields",
  },
  openGraph: {
    title: "My Fields & GIS Farm Registry — AASRA",
    description:
      "Interactive satellite GIS boundary plotter and regional crop management for Indian farmers. Zero guesswork, verified telemetry.",
    url: "http://localhost:3000/fields",
    siteName: "AASRA Precision Agriculture",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Fields & GIS Farm Registry — AASRA",
    description:
      "Draw satellite polygon boundaries, configure ICAR regional soils, and manage multi-plot farm portfolios.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FieldsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "My Fields & GIS Farm Registry",
    description:
      "Interactive satellite GIS field boundary manager and regional crop intelligence hub for precision agriculture.",
    url: "http://localhost:3000/fields",
    isPartOf: {
      "@type": "SoftwareApplication",
      name: "AASRA Precision Agriculture Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Mobile",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "http://localhost:3000",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "My Fields",
          item: "http://localhost:3000/fields",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
