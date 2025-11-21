/**
 * Parameters for navigate operation.
 */
export interface NavigateParams {
  /**
   * URL to navigate to.
   */
  url: string

  /**
   * When to consider navigation successful.
   */
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'

  /**
   * Maximum navigation time in milliseconds.
   */
  timeout?: number
}

/**
 * Parameters for click operation.
 */
export interface ClickParams {
  /**
   * CSS selector for the element to click.
   */
  selector: string

  /**
   * Maximum time in milliseconds.
   */
  timeout?: number
}

/**
 * Parameters for type operation.
 */
export interface TypeParams {
  /**
   * CSS selector for the input element.
   */
  selector: string

  /**
   * Text to type.
   */
  text: string

  /**
   * Time to wait between key presses in milliseconds.
   */
  delay?: number

  /**
   * Maximum time in milliseconds.
   */
  timeout?: number
}

/**
 * Parameters for getText operation.
 */
export interface GetTextParams {
  /**
   * CSS selector for the element. If omitted, returns all page text.
   */
  selector?: string
}

/**
 * Parameters for getHtml operation.
 */
export interface GetHtmlParams {
  /**
   * CSS selector for the element. If omitted, returns full page HTML.
   */
  selector?: string
}

/**
 * Parameters for screenshot operation.
 */
export interface ScreenshotParams {
  /**
   * Path to save the screenshot file.
   */
  path?: string

  /**
   * Capture the full scrollable page.
   */
  fullPage?: boolean

  /**
   * Image type.
   */
  type?: 'png' | 'jpeg'

  /**
   * Encoding format.
   */
  encoding?: 'base64' | 'binary'
}

/**
 * Parameters for evaluate operation.
 */
export interface EvaluateParams {
  /**
   * JavaScript code to execute.
   */
  script: string

  /**
   * Arguments to pass to the script.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[]
}

/**
 * Parameters for cookie operations.
 */
export interface CookieParams {
  /**
   * Array of cookie objects to set.
   */
  cookies: Array<{
    name: string
    value: string
    domain?: string
    path?: string
    expires?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
  }>
}

/**
 * Parameters for waitForSelector operation.
 */
export interface WaitForSelectorParams {
  /**
   * CSS selector to wait for.
   */
  selector: string

  /**
   * Maximum time in milliseconds to wait.
   */
  timeout?: number

  /**
   * Wait for element to be visible (default: true).
   */
  visible?: boolean

  /**
   * Wait for element state.
   */
  state?: 'attached' | 'detached' | 'visible' | 'hidden'
}

/**
 * Parameters for fill operation.
 */
export interface FillParams {
  /**
   * CSS selector for the input element.
   */
  selector: string

  /**
   * Text to fill.
   */
  value: string

  /**
   * Maximum time in milliseconds.
   */
  timeout?: number
}

/**
 * Parameters for isVisible operation.
 */
export interface IsVisibleParams {
  /**
   * CSS selector for the element.
   */
  selector: string
}
