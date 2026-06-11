/**
 * Builds the unified InterceptorEvent from parsed interceptor input.
 */

import { INTERCEPTOR_INPUT_VERSION } from './types.js'
import type { InterceptorEvent, InterceptorInput } from './types.js'

/**
 * Derive an InterceptorEvent from a parsed input envelope.
 *
 * The point is RESPONSE when `gatewayResponse` is present, otherwise REQUEST.
 * RESPONSE events also carry `gatewayRequest`, so `request` is populated at
 * both points when present.
 */
export function buildEvent(input: InterceptorInput): InterceptorEvent {
  const mcp = input.mcp
  // The gateway sends the inactive side as an explicit `null`, so test with
  // loose `!= null` (matches both null and undefined) and normalize the typed
  // fields to `undefined` — handler authors never see a `null`.
  const point = mcp.gatewayResponse != null ? 'RESPONSE' : 'REQUEST'

  return {
    point,
    request: mcp.gatewayRequest ?? undefined,
    response: mcp.gatewayResponse ?? undefined,
    invocationIndex: mcp.invocationIndex ?? undefined,
    raw: input,
  }
}

/**
 * Build a REQUEST-point event for unit-testing a handler.
 *
 * @example
 * ```typescript
 * const event = sampleRequest({ headers: { authorization: 'Bearer x' } })
 * const result = await handler(event.raw)
 * ```
 */
export function sampleRequest(
  opts: {
    headers?: Record<string, unknown>
    body?: unknown
    path?: string
    httpMethod?: string
  } = {}
): InterceptorEvent {
  const request = {
    ...(opts.path !== undefined ? { path: opts.path } : {}),
    ...(opts.httpMethod !== undefined ? { httpMethod: opts.httpMethod } : {}),
    headers: opts.headers ?? {},
    body: opts.body,
  }
  return buildEvent({
    interceptorInputVersion: INTERCEPTOR_INPUT_VERSION,
    mcp: { gatewayRequest: request },
  })
}

/** Build a RESPONSE-point event for unit-testing a handler. */
export function sampleResponse(
  opts: {
    statusCode?: number
    headers?: Record<string, unknown>
    body?: unknown
    requestHeaders?: Record<string, unknown>
  } = {}
): InterceptorEvent {
  return buildEvent({
    interceptorInputVersion: INTERCEPTOR_INPUT_VERSION,
    mcp: {
      gatewayRequest: { headers: opts.requestHeaders ?? {} },
      gatewayResponse: {
        statusCode: opts.statusCode ?? 200,
        headers: opts.headers ?? {},
        body: opts.body,
      },
    },
  })
}
