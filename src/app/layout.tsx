import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KeyFlow — API Key Management & Rate Limiting',
  description: 'Add API key auth, usage metering, and rate limiting to any backend in 5 minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
