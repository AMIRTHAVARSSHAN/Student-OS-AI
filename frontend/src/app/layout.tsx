import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'ScholarOS | 3D AI Operating System for Students',
  description: 'The ultimate 3D AI academic companion for school, college, and university students.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--surface-0)] text-[var(--text-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
