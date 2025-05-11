import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    LOG_LEVEL: process.env.LOG_LEVEL || '2',
    API_KEY: process.env.API_KEY || 'development-api-key-xenocrm',
  },
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  serverRuntimeConfig: {
    mongodb: {
      connectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    }
  },
};

export default nextConfig;
