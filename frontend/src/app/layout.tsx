import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pics Frame — Our Story in Frames",
  description: "A timeless, interactive memory gift webapp engineered by Deepesh Sharma (CTO & Co-Founder, FociTech).",
  authors: [{ name: "Deepesh Sharma", url: "https://focitech.in" }],
  creator: "Deepesh Sharma (CTO & Co-Founder, FociTech)",
  publisher: "FociTech",
  applicationName: "Pics Frame",
  keywords: ["Pics Frame", "Romantic WebApp", "FociTech", "Deepesh Sharma", "Memory Book", "Next.js", "FastAPI"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Pics Frame — Our Story in Frames",
    description: "Built with passion by Deepesh Sharma (CTO & Co-Founder, FociTech).",
    siteName: "Pics Frame by FociTech",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
