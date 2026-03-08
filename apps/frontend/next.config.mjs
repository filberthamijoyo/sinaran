import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /**
   * Tell Turbopack what the project root is.
   * This fixes "couldn't find next/package.json from the project directory"
   * errors when running inside a monorepo or nested apps folder.
   */
  turbopack: {
    // Point to the monorepo root so Turbopack doesn't treat `app/` itself
    // as the project directory.
    root: path.resolve(__dirname, "..", ".."),
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

