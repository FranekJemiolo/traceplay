/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages && { basePath: '/traceplay' }),
  assetPrefix: isGitHubPages ? '/traceplay' : '',
}

module.exports = nextConfig
