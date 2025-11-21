import { Browser } from '../../client.js'
import type { BrowserClientConfig } from '../../types.js'
import type {
  NavigateParams,
  ClickParams,
  TypeParams,
  GetTextParams,
  GetHtmlParams,
  ScreenshotParams,
  EvaluateParams,
  CookieParams,
  WaitForSelectorParams,
  FillParams,
  IsVisibleParams,
} from './types.js'

/**
 * Playwright-based browser automation client for AWS Bedrock AgentCore Browser service.
 *
 * Extends Browser with full browser automation capabilities using Playwright.
 * Provides methods for navigation, interaction, content extraction, and JavaScript execution.
 *
 * Sessions are automatically created on first use and Playwright connections are
 * managed internally.
 *
 * @example
 * ```typescript
 * const browser = new PlaywrightBrowser({ region: 'us-east-1' })
 *
 * // Direct usage (auto-creates session)
 * await browser.navigate({ url: 'https://example.com' })
 * await browser.click({ selector: 'button' })
 * const text = await browser.getText({ selector: 'h1' })
 *
 * // Explicit session management
 * await browser.startSession({ sessionName: 'my-session' })
 * await browser.navigate({ url: 'https://example.com' })
 * await browser.stopSession()
 * ```
 */
export class PlaywrightBrowser extends Browser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _playwrightBrowser: any = null // Playwright Browser instance
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _playwrightPage: any = null // Playwright Page instance

  /**
   * Creates a new PlaywrightBrowser instance.
   *
   * @param config - Configuration options for the client
   */
  constructor(config: BrowserClientConfig) {
    super(config)
  }

  /**
   * Stops the active browser session and closes Playwright connections.
   */
  override async stopSession(): Promise<void> {
    // Close Playwright connections first
    try {
      if (this._playwrightBrowser) {
        await this._playwrightBrowser.close()
        this._playwrightBrowser = null
        this._playwrightPage = null
      }
    } catch (error) {
      // Log but don't fail on Playwright cleanup errors
      console.warn('Error closing Playwright browser:', error)
    }

    // Call parent stopSession to clean up AWS session
    await super.stopSession()
  }

  // ===========================
  // Browser Automation
  // ===========================

  /**
   * Navigates to a URL.
   * Automatically creates a session and connects if needed.
   *
   * @param params - Navigation parameters
   */
  async navigate(params: NavigateParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.goto(params.url, {
      waitUntil: params.waitUntil ?? 'domcontentloaded',
      timeout: params.timeout,
    })
  }

  /**
   * Clicks an element on the page.
   *
   * @param params - Click parameters
   */
  async click(params: ClickParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.click(params.selector, {
      timeout: params.timeout,
    })
  }

  /**
   * Types text into an input element.
   *
   * @param params - Type parameters
   */
  async type(params: TypeParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.type(params.selector, params.text, {
      delay: params.delay,
      timeout: params.timeout,
    })
  }

  /**
   * Gets text content from an element or the page.
   *
   * @param params - GetText parameters
   * @returns Text content
   */
  async getText(params: GetTextParams = {}): Promise<string> {
    await this._ensureConnected()
    if (params.selector) {
      const element = await this._playwrightPage!.$(params.selector)
      if (!element) {
        throw new Error(`Element not found: ${params.selector}`)
      }
      return (await element.textContent()) ?? ''
    }
    return (await this._playwrightPage!.textContent('body')) ?? ''
  }

  /**
   * Gets HTML content from an element or the page.
   *
   * @param params - GetHtml parameters
   * @returns HTML content
   */
  async getHtml(params: GetHtmlParams = {}): Promise<string> {
    await this._ensureConnected()
    if (params.selector) {
      const element = await this._playwrightPage!.$(params.selector)
      if (!element) {
        throw new Error(`Element not found: ${params.selector}`)
      }
      return await element.innerHTML()
    }
    return await this._playwrightPage!.content()
  }

  /**
   * Takes a screenshot of the page.
   *
   * @param params - Screenshot parameters
   * @returns Screenshot as base64 string or Buffer
   */
  async screenshot(params?: ScreenshotParams): Promise<globalThis.Buffer | string> {
    await this._ensureConnected()
    const screenshot = await this._playwrightPage!.screenshot({
      path: params?.path,
      fullPage: params?.fullPage ?? false,
      type: params?.type ?? 'png',
    })
    return params?.encoding === 'base64' ? screenshot.toString('base64') : screenshot
  }

  /**
   * Evaluates JavaScript code in the page context.
   *
   * @param params - Evaluate parameters
   * @returns Result of the evaluation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async evaluate(params: EvaluateParams): Promise<any> {
    await this._ensureConnected()
    return await this._playwrightPage!.evaluate(params.script, params.args)
  }

  /**
   * Navigates back in browser history.
   */
  async back(): Promise<void> {
    await this._ensureConnected()
    try {
      // Try with networkidle first, which is more reliable for dynamic sites
      await this._playwrightPage!.goBack({ waitUntil: 'networkidle', timeout: 30000 })
    } catch {
      // If networkidle times out, try with load
      try {
        await this._playwrightPage!.goBack({ waitUntil: 'load', timeout: 30000 })
      } catch {
        // If still failing, just trigger the navigation without waiting
        await this._playwrightPage!.evaluate('window.history.back()')
      }
    }
  }

  /**
   * Navigates forward in browser history.
   */
  async forward(): Promise<void> {
    await this._ensureConnected()
    try {
      // Try with networkidle first, which is more reliable for dynamic sites
      await this._playwrightPage!.goForward({ waitUntil: 'networkidle', timeout: 30000 })
    } catch {
      // If networkidle times out, try with load
      try {
        await this._playwrightPage!.goForward({ waitUntil: 'load', timeout: 30000 })
      } catch {
        // If still failing, just trigger the navigation without waiting
        await this._playwrightPage!.evaluate('window.history.forward()')
      }
    }
  }

  /**
   * Refreshes the current page.
   */
  async refresh(): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.reload()
  }

  /**
   * Gets all cookies.
   *
   * @returns Array of cookies
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCookies(): Promise<any[]> {
    await this._ensureConnected()
    return await this._playwrightPage!.context().cookies()
  }

  /**
   * Sets cookies.
   *
   * @param params - Cookie parameters
   */
  async setCookies(params: CookieParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.context().addCookies(params.cookies)
  }

  /**
   * Presses a keyboard key.
   *
   * @param key - Key name (e.g., 'Enter', 'Tab', 'Escape')
   */
  async pressKey(key: string): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.keyboard.press(key)
  }

  /**
   * Waits for an element to be present in the DOM.
   *
   * @param params - WaitForSelector parameters
   */
  async waitForSelector(params: WaitForSelectorParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.waitForSelector(params.selector, {
      timeout: params.timeout ?? 30000,
      state: params.state ?? (params.visible !== false ? 'visible' : 'attached'),
    })
  }

  /**
   * Fills an input element with text (clears existing value first).
   * More reliable than type() for forms.
   *
   * @param params - Fill parameters
   */
  async fill(params: FillParams): Promise<void> {
    await this._ensureConnected()
    await this._playwrightPage!.fill(params.selector, params.value, {
      timeout: params.timeout,
    })
  }

  /**
   * Checks if an element is visible on the page.
   *
   * @param params - IsVisible parameters
   * @returns true if element is visible, false otherwise
   */
  async isVisible(params: IsVisibleParams): Promise<boolean> {
    await this._ensureConnected()
    try {
      const element = await this._playwrightPage!.$(params.selector)
      if (!element) {
        return false
      }
      return await element.isVisible()
    } catch {
      return false
    }
  }

  // ===========================
  // Private Helper Methods
  // ===========================

  /**
   * Ensures a session exists and Playwright is connected.
   */
  private async _ensureConnected(): Promise<void> {
    // Ensure session exists
    if (!this._session) {
      await this.startSession()
    }

    // Ensure Playwright connection exists
    if (!this._playwrightBrowser || !this._playwrightPage) {
      await this._connectPlaywright()
    }
  }

  /**
   * Connects to the browser via Playwright WebSocket.
   */
  private async _connectPlaywright(): Promise<void> {
    if (!this._session) {
      throw new Error('No active session')
    }

    // Dynamically import Playwright
    const { chromium } = await import('playwright')

    // Get WebSocket connection details
    const wsConnection = await this.generateWebSocketUrl()

    // Connect to browser via CDP
    this._playwrightBrowser = await chromium.connectOverCDP({
      endpointURL: wsConnection.url,
      headers: wsConnection.headers,
    })

    // Get the default context and page
    const contexts = this._playwrightBrowser.contexts()
    if (contexts.length === 0) {
      throw new Error('No browser contexts available')
    }

    const context = contexts[0]
    const pages = context.pages()

    if (pages.length === 0) {
      // Create a new page if none exist
      this._playwrightPage = await context.newPage()
    } else {
      // Use the first page
      this._playwrightPage = pages[0]
    }
  }
}
