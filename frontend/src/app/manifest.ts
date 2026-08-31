import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pics Frame — Personalized Memory Gift WebApp",
    short_name: "Pics Frame",
    description: "A timeless, interactive memory gift webapp engineered by Deepesh Sharma (CTO & Co-Founder, FociTech).",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0a14",
    theme_color: "#db2777",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
