import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    // Remove turbopack for now due to compatibility issues
  }
};

export default nextConfig;
