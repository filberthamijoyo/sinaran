import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactNode, Suspense } from 'react';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'Sinaran ERP',
  description: 'PT Triputra Textile Industry — Production Pipeline',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
