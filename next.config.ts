import type { NextConfig } from 'next'

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGitHubPages ? '/miftahul-mubin' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
