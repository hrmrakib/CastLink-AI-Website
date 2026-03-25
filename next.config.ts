import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "10.10.12.49",
        port: "8002",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "69.62.116.203",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
