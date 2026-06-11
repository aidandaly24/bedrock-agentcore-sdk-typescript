/**
 * AgentCore Gateway interceptor module.
 *
 * Build Lambda interceptors for AgentCore gateways without hand-constructing
 * the request/response envelope.
 *
 * @example
 * ```typescript
 * import { createInterceptor, InterceptorResponse } from 'bedrock-agentcore/gateway'
 *
 * export const handler = createInterceptor((event) => {
 *   if (event.point === 'REQUEST') {
 *     if (!event.request?.headers?.authorization) return InterceptorResponse.deny(403, { error: 'forbidden' })
 *     return InterceptorResponse.passThrough(event)
 *   }
 *   return InterceptorResponse.transformResponse(200, event.response?.headers ?? {}, event.response?.body)
 * })
 * ```
 */

export { createInterceptor } from './interceptor.js'
export { InterceptorResponse } from './response.js'
export { sampleRequest, sampleResponse, buildEvent } from './event.js'
export { INTERCEPTOR_INPUT_VERSION, INTERCEPTOR_OUTPUT_VERSION } from './types.js'
export type {
  InterceptorEvent,
  InterceptorPoint,
  InterceptorHandler,
  InterceptorInput,
  InterceptorOutput,
  InterceptorResponseValue,
  GatewayRequest,
  GatewayResponse,
} from './types.js'
