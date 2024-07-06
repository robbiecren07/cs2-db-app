/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'uhvsalvzgjhuyacryiir.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
