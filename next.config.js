/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production builds
  swcMinify: true,
  // Compress output
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
