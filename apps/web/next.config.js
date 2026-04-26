/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@traceplay/ui', '@traceplay/embed-sdk'],
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.GITHUB_PAGES ? '/traceplay' : '',
  assetPrefix: process.env.GITHUB_PAGES ? '/traceplay' : '',
}

module.exports = nextConfig
