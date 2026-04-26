import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TracePlay - AI-Powered Educational Platform',
  description: 'Interactive tracing and learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
