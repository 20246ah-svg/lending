import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "*.e2b.app",
    "localhost:3000",
  ],
};

export default nextConfig;
