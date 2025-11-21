/**
 * Playwright Browser Integration
 *
 * This module provides Playwright-based browser automation for AWS Bedrock AgentCore Browser service.
 * It extends the base Browser with full browser automation capabilities.
 *
 * @example
 * ```typescript
 * import { PlaywrightBrowser } from '@aws-sdk/bedrock-agentcore-sdk/browser/playwright'
 *
 * const browser = new PlaywrightBrowser({ region: 'us-west-2' })
 * await browser.navigate({ url: 'https://example.com' })
 * await browser.click({ selector: 'button' })
 * const text = await browser.getText({ selector: 'h1' })
 * await browser.stopSession()
 * ```
 */

export { PlaywrightBrowser } from './client.js'
export type {
  NavigateParams,
  ClickParams,
  TypeParams,
  GetTextParams,
  GetHtmlParams,
  ScreenshotParams,
  EvaluateParams,
  CookieParams,
} from './types.js'
