import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Shell } from '@/components/shell';

export const metadata: Metadata = {
  title: 'SENTINEL X — Cybersecurity Operations & Threat Intelligence Platform',
  description: 'Enterprise SIEM, Attack Simulation Lab, Incident Response & Vulnerability Management Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
