import { tool } from 'ai'
import { z } from 'zod'
import type { PlaywrightBrowser } from '../playwright/client.js'

/**
 * Creates a Vercel AI tool for taking screenshots.
 * Thin wrapper around PlaywrightBrowser.screenshot()
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export function createScreenshotTool(client: PlaywrightBrowser) {
  return tool({
    description: 'Take a screenshot of the page',
    inputSchema: z.object({
      path: z.string().optional().describe('Path to save the screenshot file'),
      fullPage: z.boolean().optional().describe('Capture the full scrollable page'),
      type: z.enum(['png', 'jpeg']).optional().describe('Image type'),
      encoding: z.enum(['base64', 'binary']).optional().describe('Encoding format'),
    }),
    execute: async ({ path, fullPage, type, encoding }) => {
      'use step'
      try {
        const params: { path?: string; fullPage?: boolean; type?: 'png' | 'jpeg'; encoding?: 'base64' | 'binary' } = {}
        if (path !== undefined) params.path = path
        if (fullPage !== undefined) params.fullPage = fullPage
        if (type !== undefined) params.type = type
        if (encoding !== undefined) params.encoding = encoding
        const screenshot = await client.screenshot(params)
        const isBase64 = encoding === 'base64'
        return {
          success: true,
          message: path ? `Screenshot saved to ${path}` : 'Screenshot captured',
          screenshot: isBase64 ? screenshot : undefined,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    },
  })
}
