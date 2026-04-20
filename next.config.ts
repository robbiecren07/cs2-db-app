import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    default: {
      stale: 60 * 60 * 24 * 365, // 1 year
      revalidate: 60 * 60 * 24 * 30, // 30 day
      expire: 60 * 60 * 24 * 365, // 1 year
    },
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
