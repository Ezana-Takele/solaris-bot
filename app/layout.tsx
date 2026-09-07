import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOLARIS - Autonomous Real-Time Memecoin Trading Terminal',
  description: 'Institutional-grade real-time memecoin sniper and autonomous trading bot with multi-layer rug-filtering and asymmetric risk management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080a0f] text-slate-100 min-h-screen antialiased selection:bg-brand-green/30 selection:text-brand-green">
        {children}
      </body>
    </html>
  );
}

