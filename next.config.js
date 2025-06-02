/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'accessibility-ai-beryl.vercel.app']
    }
  }
}

module.exports = nextConfig 