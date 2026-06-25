import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.10.12.49",
        port: "8000",
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
    ],
  },
};

export default nextConfig;
