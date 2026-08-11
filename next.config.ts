import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.10.29.50",
        port: "8050",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "69.62.116.203",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "69.62.116.203",
        port: "8002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.poolofcast.com",
      },
      {
        protocol: "https",
        hostname: "ai.poolofcast.com",
      },
      {
        protocol: "https",
        hostname: "api.poolofcast.comhttps",
      },
    ],
  },
};

export default nextConfig;
