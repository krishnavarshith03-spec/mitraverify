import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  turbopack: { root: "./" },
};

export default nextConfig;
