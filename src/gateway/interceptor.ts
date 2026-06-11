/**
 * The createInterceptor higher-order wrapper.
 */

import { buildEvent } from './event.js'
import { InterceptorResponse, toEnvelope } from './response.js'
import { INTERCEPTOR_INPUT_VERSION, InterceptorInputSchema } from './types.js'
import type { InterceptorHandler, InterceptorOutput, InterceptorResponseValue } from './types.js'

/** A fail-closed 500 envelope returned when input parsing or the handler fails. */
function safe500(): InterceptorOutput {
  return toEnvelope(InterceptorResponse.deny(500, { error: 'interceptor_error' }))
}

/**
 * A handler must return a value from one of the `InterceptorResponse`
 * constructors (carrying `transformedRequest` or `transformedResponse`). Any
 * other return — a bare value, `{}`, snake_case keys, or the raw gateway
 * envelope — would otherwise serialize to an empty no-op envelope the gateway
 * silently treats as pass-through, letting a buggy REQUEST interceptor leak
 * unauthorized traffic. Mirrors the Python decorator's `isinstance` guard.
 */
function isInterceptorResponseValue(value: unknown): value is InterceptorResponseValue {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v.transformedRequest !== undefined || v.transformedResponse !== undefined
}

/**
 * Wraps a typed interceptor function as a Lambda handler.
 *
 * The wrapper parses the raw event into a typed `InterceptorEvent`, serializes
 * the returned value into the envelope the gateway expects (always stamping
 * `interceptorOutputVersion`), and converts any parse failure or thrown error
 * into a safe 500 response — so the gateway does not retry and double-invoke
 * the interceptor, and a broken REQUEST interceptor fails closed rather than
 * letting unauthorized traffic through.
 *
 * @example
 * ```typescript
 * export const handler = createInterceptor((event) => {
 *   if (!event.request?.headers?.authorization) return InterceptorResponse.deny(403, { error: 'forbidden' })
 *   return InterceptorResponse.passThrough(event)
 * })
 * ```
 */
export function createInterceptor(fn: InterceptorHandler): (rawEvent: unknown) => Promise<InterceptorOutput> {
  return async (rawEvent: unknown): Promise<InterceptorOutput> => {
    let event
    try {
      const parsed = InterceptorInputSchema.parse(rawEvent)
      if (
        parsed.interceptorInputVersion !== undefined &&
        parsed.interceptorInputVersion !== INTERCEPTOR_INPUT_VERSION
      ) {
        console.warn(
          `Interceptor input version ${parsed.interceptorInputVersion} does not match expected ` +
            `${INTERCEPTOR_INPUT_VERSION}; parsing best-effort.`
        )
      }
      event = buildEvent(parsed)
    } catch (err) {
      console.error('Failed to parse interceptor input; returning a 500 response.', err)
      return safe500()
    }

    try {
      const result = await fn(event)
      if (!isInterceptorResponseValue(result)) {
        console.error('Interceptor handler did not return an InterceptorResponse; returning a 500 response.', result)
        return safe500()
      }
      return toEnvelope(result)
    } catch (err) {
      console.error('Interceptor handler threw; returning a 500 response.', err)
      return safe500()
    }
  }
}
