/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/traceplay' : '',
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/traceplay' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
