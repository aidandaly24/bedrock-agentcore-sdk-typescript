import type { NextConfig } from 'next'

/**
 * Next.js configuration for deep-research-ui
 *
 * Key configuration:
 * - Externalizes Playwright packages to prevent webpack bundling errors
 * - Playwright has native Node.js binaries that cannot be bundled by webpack
 * - The BrowserTools use Playwright to connect to AWS Bedrock Browser via WebSocket
 */
const nextConfig: NextConfig = {
  // Externalize Playwright packages for server-side API routes
  // These packages contain native binaries and should not be bundled by webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize all Playwright-related packages
      config.externals = [...(config.externals || []), 'playwright', 'playwright-core', 'chromium-bidi']
    }
    return config
  },
}

export default nextConfig
