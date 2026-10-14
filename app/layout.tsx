import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JARVIS TV — Live TV Indonesia",
  description: "Tonton channel TV Indonesia dari playlist IPTV publik di JARVIS TV.",
  applicationName: "JARVIS TV",
  themeColor: "#07111f"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
