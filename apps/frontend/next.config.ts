import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Tell Turbopack what the project root is.
   * This fixes "couldn't find next/package.json from the project directory" errors
   * when running inside a monorepo or nested apps folder.
   */
  turbopack: {
    // Point to the Next.js app root so Turbopack doesn't treat `app/` itself
    // as the project directory.
    root: __dirname,
  },
  /**
   * General performance-related defaults.
   */
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Adjust domains as you start using `next/image`
    remotePatterns: [],
  },
};

export default nextConfig;

