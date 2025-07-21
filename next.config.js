/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PROKERALA_CLIENT_ID: process.env.PROKERALA_CLIENT_ID,
    PROKERALA_CLIENT_SECRET: process.env.PROKERALA_CLIENT_SECRET,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
}

module.exports = nextConfig 