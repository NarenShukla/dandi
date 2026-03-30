import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Absolute app root so Turbopack does not follow a parent lockfile (e.g. ~/package-lock.json). */
const appRoot = path.resolve(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: appRoot,
    resolveAlias: {
      tailwindcss: path.join(appRoot, "node_modules", "tailwindcss"),
      "tw-animate-css": path.join(appRoot, "node_modules", "tw-animate-css"),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
