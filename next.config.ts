import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/for-dealers",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "https://wa.me/18683224691?text=Hi%20ALL%20AUTO%20TT%2C%20I%20need%20help%20finding%20a%20part.",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
