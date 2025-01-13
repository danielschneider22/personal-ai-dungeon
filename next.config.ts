import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"], // Allow images from Firebase Storage
  },
};

export default nextConfig;
