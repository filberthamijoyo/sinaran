import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Sinaran ERP",
  description: "PT Triputra Textile Manufacturing ERP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        {/*
          Patch for Next.js 16.x + Turbopack "negative time stamp" error.
          Next.js internally calls performance.measure() to profile server
          component rendering. When a server component immediately calls
          redirect(), the end mark can precede the start mark, yielding a
          negative duration that the browser Performance API rejects.
          This is a known bug: github.com/vercel/next.js/issues/86060
          The patch wraps performance.measure to catch and discard that
          specific error without affecting any other calls.
          Only applies in development (process.env.NODE_ENV guard).
        */}
        <Script id="perf-measure-fix" strategy="beforeInteractive">{`
(function () {
  if (process.env.NODE_ENV !== 'development') return;
  try {
    var perf = window.performance;
    if (!perf || typeof perf.measure !== 'function' || perf.__patched) return;
    perf.__patched = true;
    var original = perf.measure.bind(perf);
    perf.measure = function () {
      try {
        return original.apply(perf, arguments);
      } catch (err) {
        var msg = (err && err.message) || '';
        if (msg.indexOf('negative time stamp') !== -1) return;
        throw err;
      }
    };
  } catch (_) {}
})();
        `}</Script>
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
