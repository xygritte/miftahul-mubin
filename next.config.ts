import type { NextConfig } from 'next'

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPages ? '/miftahul-mubin' : '')

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
