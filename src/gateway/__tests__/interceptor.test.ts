import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createInterceptor } from '../interceptor.js'
import { InterceptorResponse } from '../response.js'
import type { InterceptorEvent } from '../types.js'

const requestEvent = (headers: Record<string, unknown> = {}, body: unknown = undefined) => ({
  interceptorInputVersion: '1.0',
  mcp: { gatewayRequest: { headers, body } },
})

const responseEvent = (statusCode = 200, body: unknown = undefined) => ({
  interceptorInputVersion: '1.0',
  mcp: { gatewayRequest: { headers: {} }, gatewayResponse: { statusCode, headers: {}, body } },
})

describe('createInterceptor', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes a pass-through request with the version stamped', async () => {
    const handler = createInterceptor((event) => InterceptorResponse.passThrough(event))
    const out = await handler(requestEvent({ x: '1' }, { k: 'v' }))

    expect(out.interceptorOutputVersion).toBe('1.0')
    expect(out.mcp.transformedGatewayRequest).toEqual({ headers: { x: '1' }, body: { k: 'v' } })
  })

  it('serializes a deny as a transformedGatewayResponse', async () => {
    const handler = createInterceptor(() => InterceptorResponse.deny(403, { error: 'forbidden' }))
    const out = await handler(requestEvent())

    expect(out.mcp.transformedGatewayResponse?.statusCode).toBe(403)
    expect(out.mcp.transformedGatewayResponse?.body).toEqual({ error: 'forbidden' })
  })

  it('derives the point and supports async handlers', async () => {
    const seen: string[] = []
    const handler = createInterceptor(async (event: InterceptorEvent) => {
      seen.push(event.point)
      return InterceptorResponse.passThrough(event)
    })
    await handler(requestEvent())
    await handler(responseEvent())

    expect(seen).toEqual(['REQUEST', 'RESPONSE'])
  })

  it('warns but parses on a mismatched input version', async () => {
    const handler = createInterceptor((event) => InterceptorResponse.passThrough(event))
    const out = await handler({ interceptorInputVersion: '9.9', mcp: { gatewayRequest: { headers: {} } } })

    expect(out.interceptorOutputVersion).toBe('1.0')
    expect(warnSpy).toHaveBeenCalledOnce()
  })

  it('returns a 500 when the handler throws (no retry, fail closed)', async () => {
    const handler = createInterceptor(() => {
      throw new Error('boom')
    })
    const out = await handler(requestEvent())

    expect(out.mcp.transformedGatewayResponse?.statusCode).toBe(500)
    // Fail closed: never a transformedGatewayRequest that would let the call continue.
    expect(out.mcp.transformedGatewayRequest).toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('returns a 500 when the input fails schema parsing', async () => {
    const handler = createInterceptor((event) => InterceptorResponse.passThrough(event))
    const out = await handler({ not: 'a valid envelope' })

    expect(out.interceptorOutputVersion).toBe('1.0')
    expect(out.mcp.transformedGatewayResponse?.statusCode).toBe(500)
    expect(errorSpy).toHaveBeenCalled()
  })

  it('returns a 500 when an async handler rejects', async () => {
    const handler = createInterceptor(async () => {
      return Promise.reject(new Error('async boom'))
    })
    const out = await handler(requestEvent())

    expect(out.mcp.transformedGatewayResponse?.statusCode).toBe(500)
  })

  // Regression: the live gateway sends the inactive side as an explicit `null`
  // (e.g. `gatewayResponse: null` at the REQUEST point), plus extra keys like
  // `context` and `rawGatewayRequest`. An earlier `.optional()` schema rejected
  // the null and made every real request fail closed with a 500. This payload
  // is a verbatim capture from a deployed gateway.
  it('passes through a real gateway REQUEST envelope with gatewayResponse: null', async () => {
    const realGatewayRequest = {
      interceptorInputVersion: '1.0',
      mcp: {
        gatewayRequest: {
          path: '/mcp',
          httpMethod: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
          body: { id: 1, jsonrpc: '2.0', method: 'tools/list', params: {} },
          context: null,
        },
        gatewayResponse: null,
        rawGatewayRequest: { body: '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' },
      },
    }

    let seenPoint: string | undefined
    const handler = createInterceptor((event) => {
      seenPoint = event.point
      return InterceptorResponse.passThrough(event)
    })
    const out = await handler(realGatewayRequest)

    expect(seenPoint).toBe('REQUEST')
    expect(out.mcp.transformedGatewayResponse).toBeUndefined()
    expect(out.mcp.transformedGatewayRequest).toEqual({
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: { id: 1, jsonrpc: '2.0', method: 'tools/list', params: {} },
    })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  // Parity with the Python decorator's isinstance guard: a handler that returns
  // the wrong shape must fail CLOSED (500), not produce an empty no-op envelope
  // the gateway treats as pass-through (which would leak unauthorized traffic).
  it.each([
    ['a bare number', 42],
    ['a string', 'hi'],
    ['an empty object', {}],
    ['snake_case keys', { transformed_request: { headers: {}, body: {} } }],
    ['a raw gateway output envelope', { interceptorOutputVersion: '1.0', mcp: {} }],
  ])('returns a 500 when the handler returns %s (fail closed, not no-op)', async (_label, badReturn) => {
    const handler = createInterceptor((() => badReturn) as never)
    const out = await handler(requestEvent({ authorization: 'Bearer x' }))

    expect(out.mcp.transformedGatewayResponse?.statusCode).toBe(500)
    expect(out.mcp.transformedGatewayRequest).toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()
  })

  it('treats gatewayRequest: null at the RESPONSE point as absent (no crash)', async () => {
    let seenPoint: string | undefined
    const handler = createInterceptor((event) => {
      seenPoint = event.point
      return InterceptorResponse.passThrough(event)
    })
    const out = await handler({
      interceptorInputVersion: '1.0',
      mcp: { gatewayRequest: null, gatewayResponse: { statusCode: 200, headers: {}, body: { ok: true } } },
    })

    expect(seenPoint).toBe('RESPONSE')
    expect(out.mcp.transformedGatewayResponse).toEqual({ statusCode: 200, headers: {}, body: { ok: true } })
  })
})
