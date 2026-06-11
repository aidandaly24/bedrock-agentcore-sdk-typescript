/**
 * Fluent constructors for the interceptor output, plus envelope serialization.
 */

import { INTERCEPTOR_OUTPUT_VERSION } from './types.js'
import type { InterceptorEvent, InterceptorOutput, InterceptorResponseValue } from './types.js'

/**
 * Constructors for an interceptor's output. Use these rather than building the
 * envelope by hand — the SDK stamps the mandatory `interceptorOutputVersion`.
 *
 * @example
 * ```typescript
 * if (!event.request?.headers?.authorization) return InterceptorResponse.deny(403, { error: 'forbidden' })
 * return InterceptorResponse.passThrough(event)
 * ```
 */
export const InterceptorResponse = {
  /** Forward the request/response unchanged (echoes request at REQUEST, response at RESPONSE). */
  passThrough(event: InterceptorEvent): InterceptorResponseValue {
    if (event.point === 'RESPONSE') {
      const resp = event.response ?? {}
      return {
        transformedResponse: {
          statusCode: resp.statusCode ?? 200,
          headers: (resp.headers ?? {}) as Record<string, unknown>,
          body: resp.body,
        },
      }
    }
    const req = event.request ?? {}
    return { transformedRequest: { headers: (req.headers ?? {}) as Record<string, unknown>, body: req.body } }
  },

  /** Continue to the target with a modified request (REQUEST point). */
  transformRequest(headers: Record<string, unknown>, body: unknown): InterceptorResponseValue {
    return { transformedRequest: { headers, body } }
  },

  /** Return a modified response to the caller (RESPONSE point, or a REQUEST-point short-circuit). */
  transformResponse(statusCode: number, headers: Record<string, unknown>, body: unknown): InterceptorResponseValue {
    return { transformedResponse: { statusCode, headers, body } }
  },

  /** Short-circuit with an error response (e.g. a 403 from an auth check). */
  deny(statusCode: number, body: unknown, headers?: Record<string, unknown>): InterceptorResponseValue {
    return {
      transformedResponse: {
        statusCode,
        headers: headers ?? { 'Content-Type': 'application/json' },
        body,
      },
    }
  },
}

/**
 * Serialize a response value to the gateway's expected output envelope, always
 * stamping the version. Exported for the wrapper; handlers should not call it.
 */
export function toEnvelope(value: InterceptorResponseValue): InterceptorOutput {
  return {
    interceptorOutputVersion: INTERCEPTOR_OUTPUT_VERSION,
    mcp: {
      ...(value.transformedRequest !== undefined ? { transformedGatewayRequest: value.transformedRequest } : {}),
      ...(value.transformedResponse !== undefined ? { transformedGatewayResponse: value.transformedResponse } : {}),
    },
  }
}
