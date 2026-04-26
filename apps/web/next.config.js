/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@traceplay/ui', '@traceplay/embed-sdk'],
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
