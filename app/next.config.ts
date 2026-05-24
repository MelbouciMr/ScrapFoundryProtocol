import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@privy-io/server-auth"],
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
