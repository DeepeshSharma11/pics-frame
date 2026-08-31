import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0c0a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pics-frame.vercel.app"),
  title: {
    default: "Pics Frame — Our Story in Frames | Romantic Memory Gift WebApp",
    template: "%s | Pics Frame by FociTech",
  },
  description:
    "Create and share unforgettable, personalized 3D memory gifts with floating polaroids, a flip storybook album, real-time relationship counter, romantic soundscapes, and wax-sealed letters. Engineered by Deepesh Sharma (CTO & Co-Founder, FociTech).",
  keywords: [
    "Pics Frame",
    "Romantic Gift WebApp",
    "Personalized Gift for Girlfriend",
    "Personalized Gift for Boyfriend",
    "Anniversary Gift Online",
    "Digital Memory Book",
    "3D Polaroid Gallery",
    "FociTech",
    "Deepesh Sharma",
    "Next.js Romantic App",
    "Interactive Love Letter",
    "Relationship Days Counter",
    "Love Proposal WebApp",
  ],
  authors: [{ name: "Deepesh Sharma", url: "https://focitech.in" }],
  creator: "Deepesh Sharma (CTO & Co-Founder, FociTech)",
  publisher: "FociTech",
  applicationName: "Pics Frame",
  category: "Lifestyle & Romance",
  alternates: {
    canonical: "https://pics-frame.vercel.app",
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Pics Frame — Our Story in Frames | Romantic Memory Gift",
    description:
      "A personalized, interactive keepsake featuring floating 3D polaroids, flip storybook album, relationship timer & love letter. Built with love by Deepesh Sharma (CTO & Co-Founder, FociTech).",
    url: "https://pics-frame.vercel.app",
    siteName: "Pics Frame by FociTech",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pics Frame — Interactive Romantic Memory WebApp",
    description:
      "Turn 4–5 favorite photos into a personalized 3D memory gift with floating polaroids, ambient music, and love letter. Created by Deepesh Sharma (FociTech).",
    creator: "@deepeshsharma",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://pics-frame.vercel.app/#webapp",
      name: "Pics Frame",
      url: "https://pics-frame.vercel.app",
      description:
        "A personalized memory gift web application for couples featuring 3D polaroids, storybook album, real-time relationship counter, and custom themes.",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      author: {
        "@type": "Person",
        name: "Deepesh Sharma",
        jobTitle: "CTO & Co-Founder",
        url: "https://focitech.in",
        worksFor: {
          "@type": "Organization",
          name: "FociTech",
          url: "https://focitech.in",
        },
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://focitech.in/#organization",
      name: "FociTech",
      url: "https://focitech.in",
      logo: "https://pics-frame.vercel.app/icon-192.png",
      founder: {
        "@type": "Person",
        name: "Deepesh Sharma",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
