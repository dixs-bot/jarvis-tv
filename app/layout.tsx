import type { Metadata } from 'next';
import './globals.css';
import { MonetagLoader } from '@/components/ads/MonetagLoader';
import { AdsterraScripts } from '@/components/ads/AdsterraScripts';

export const metadata: Metadata = {
  title: 'JARVIS TV - Live Streaming TV Indonesia',
  description: 'Streaming siaran televisi nasional dan hiburan terlengkap',
  // TAMBAHKAN KODE VERIFIKASI GOOGLE DI SINI:
  verification: {
    google: '6N-Mfe4cyHyY-Fl9Fo4-iOUfmIVjc_IebHSCy8PsuRA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <MonetagLoader />
        <AdsterraScripts />
        {children}
      </body>
    </html>
  );
}
