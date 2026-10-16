
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { AppProvider } from "@/context/AppContext";
import { MonetagLoader } from "@/components/ads/MonetagLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE.name} — Your Ultimate Live TV Experience`,
  description:
    "Enjoy your ultimate live TV experience with JARVIS TV. Discover live television channels, movies, and entertainment in one place, anytime, anywhere.",
  applicationName: SITE.name,
  keywords: [
    "JARVIS TV",
    "live TV streaming",
    "watch live TV",
    "online television",
    "live TV channels",
    "streaming entertainment",
    "watch TV online",
  ],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "6N-Mfe4cyHyY-Fl9Fo4-iOUfmIVjc_IebHSCy8PsuRA",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AppProvider>{children}</AppProvider>
        <MonetagLoader />
      </body>
    </html>
  );
}
