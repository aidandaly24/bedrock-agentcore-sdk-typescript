import type { AwsCredentialIdentityProvider } from '@aws-sdk/types'

/**
 * Default browser identifier for system browser.
 */
export const DEFAULT_IDENTIFIER = 'aws.browser.v1'

/**
 * Default session name.
 */
export const DEFAULT_SESSION_NAME = 'default'

/**
 * Default session timeout in seconds (1 hour).
 */
export const DEFAULT_TIMEOUT = 3600

/**
 * Default AWS region.
 */
export const DEFAULT_REGION = 'us-west-2'

/**
 * Configuration options for BrowserClient.
 */
export interface BrowserClientConfig {
  /**
   * AWS region where the browser service is deployed.
   * Defaults to process.env.AWS_REGION or 'us-west-2'.
   */
  region?: string

  /**
   * Browser identifier to use for sessions.
   * Defaults to 'aws.browser.v1' for system browser.
   */
  identifier?: string

  /**
   * Optional AWS credentials provider.
   * When omitted, the SDK uses the default Node.js credential provider chain.
   *
   * @example
   * Using Vercel OIDC credentials:
   * ```ts
   * import { vercelOidcAwsCredentials } from '\@vercel/oidc-aws-credentials-provider'
   *
   * const browser = new BrowserClient(\{
   *   region: process.env.AWS_REGION || 'us-west-2',
   *   credentialsProvider: vercelOidcAwsCredentials()
   * \})
   * ```
   */
  credentialsProvider?: AwsCredentialIdentityProvider
}

/**
 * Parameters for starting a browser session.
 */
export interface StartSessionParams {
  /**
   * Optional name for the browser session.
   * If not provided, defaults to 'default'.
   */
  sessionName?: string

  /**
   * Session timeout in seconds.
   * Valid range: 1-28800 seconds (1 second to 8 hours).
   * Defaults to 3600 seconds (1 hour).
   */
  timeout?: number

  /**
   * Viewport dimensions for the browser.
   */
  viewport?: ViewportConfig
}

/**
 * Viewport configuration for browser sessions.
 */
export interface ViewportConfig {
  /**
   * Viewport width in pixels.
   */
  width: number

  /**
   * Viewport height in pixels.
   */
  height: number
}

/**
 * Information about an active browser session.
 */
export interface SessionInfo {
  /**
   * Name of the session.
   */
  sessionName: string

  /**
   * Unique session identifier assigned by AWS.
   */
  sessionId: string

  /**
   * Timestamp when the session was created.
   */
  createdAt: Date

  /**
   * Optional description of the session.
   */
  description?: string
}

/**
 * WebSocket connection details for browser automation.
 */
export interface WebSocketConnection {
  /**
   * WebSocket URL (wss://) for connecting to the browser.
   */
  url: string

  /**
   * HTTP headers required for WebSocket authentication.
   * Includes Authorization, X-Amz-Date, and security token headers.
   */
  headers: Record<string, string>
}

/**
 * Session status information.
 */
export interface SessionStatus {
  /**
   * Current status of the session.
   */
  status: 'READY' | 'TERMINATED' | 'TERMINATING'

  /**
   * Timestamp when the session was created.
   */
  createdAt?: Date

  /**
   * Timestamp when the session was last updated.
   */
  updatedAt?: Date
}

/**
 * Result of a browser operation.
 */
export interface BrowserOperationResult {
  /**
   * Whether the operation succeeded.
   */
  success: boolean

  /**
   * Error message if the operation failed.
   */
  error?: string

  /**
   * Additional data returned from the operation.
   */
  data?: unknown
}
