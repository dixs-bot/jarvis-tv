import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE } from "@/config/site";
import { AppProvider } from "@/context/AppContext";
import { MonetagLoader } from "@/components/ads/MonetagLoader";
import "./globals.css";

export const metadata: Metadata = {
title: "${SITE.name} — ${SITE.tagline}",
description: SITE.description,
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
