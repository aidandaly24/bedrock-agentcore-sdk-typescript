/**
 * Types and schemas for the Lambda interceptor envelope contract.
 *
 * The gateway invokes an interceptor with an input envelope and expects a
 * specific output envelope back. These schemas parse the input and the
 * `createInterceptor` wrapper builds a guaranteed-valid output, so handler
 * authors never construct the wire shape (or its mandatory
 * `interceptorOutputVersion`) by hand.
 */

import { z } from 'zod'

/**
 * The output envelope MUST carry this version. Omitting it makes the gateway
 * silently treat the interceptor as a no-op, so the SDK always stamps it.
 */
export const INTERCEPTOR_OUTPUT_VERSION = '1.0'

/** The version the gateway stamps on the input envelope (soft-checked, never rejected). */
export const INTERCEPTOR_INPUT_VERSION = '1.0'

/** `REQUEST` fires before the gateway target; `RESPONSE` fires after it returns. */
export type InterceptorPoint = 'REQUEST' | 'RESPONSE'

export const GatewayRequestSchema = z.object({
  path: z.string().optional(),
  httpMethod: z.string().optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
  body: z.unknown().optional(),
})

export const GatewayResponseSchema = z.object({
  statusCode: z.number().optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
  body: z.unknown().optional(),
})

export const InterceptorInputSchema = z.object({
  interceptorInputVersion: z.string().optional(),
  // The gateway sends the inactive side as an explicit `null` (e.g.
  // `gatewayResponse: null` at the REQUEST point), not as an absent key.
  // `.nullish()` accepts both null and undefined — `.optional()` alone rejects
  // null and would make `createInterceptor` fail closed on every live request.
  mcp: z.object({
    gatewayRequest: GatewayRequestSchema.nullish(),
    gatewayResponse: GatewayResponseSchema.nullish(),
    invocationIndex: z.number().nullish(),
  }),
})

export type GatewayRequest = z.infer<typeof GatewayRequestSchema>
export type GatewayResponse = z.infer<typeof GatewayResponseSchema>
export type InterceptorInput = z.infer<typeof InterceptorInputSchema>

/**
 * Parsed interceptor input handed to a handler.
 *
 * `request` is present at both points; `response` only at the RESPONSE point.
 * `point` is derived from which envelope keys the gateway sent.
 */
export interface InterceptorEvent {
  point: InterceptorPoint
  request: GatewayRequest | undefined
  response: GatewayResponse | undefined
  invocationIndex: number | undefined
  /** The unparsed event, for fields not surfaced as typed fields. */
  raw: unknown
}

/** The output envelope returned to the gateway. Build it via `InterceptorResponse`. */
export interface InterceptorOutput {
  interceptorOutputVersion: string
  mcp: {
    transformedGatewayRequest?: { headers: Record<string, unknown>; body: unknown }
    transformedGatewayResponse?: { statusCode: number; headers: Record<string, unknown>; body: unknown }
  }
}

/** A handler receives a typed event and returns an interceptor response value. */
export type InterceptorHandler = (
  event: InterceptorEvent
) => InterceptorResponseValue | Promise<InterceptorResponseValue>

/** Internal value produced by the `InterceptorResponse` constructors. */
export interface InterceptorResponseValue {
  transformedRequest?: { headers: Record<string, unknown>; body: unknown }
  transformedResponse?: { statusCode: number; headers: Record<string, unknown>; body: unknown }
}
