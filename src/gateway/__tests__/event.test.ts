import { describe, it, expect } from 'vitest'
import { buildEvent, sampleRequest, sampleResponse } from '../event.js'

describe('buildEvent', () => {
  it('derives REQUEST when only gatewayRequest is present', () => {
    const event = buildEvent({ mcp: { gatewayRequest: { headers: { a: 'b' } } } })
    expect(event.point).toBe('REQUEST')
    expect(event.request?.headers).toEqual({ a: 'b' })
    expect(event.response).toBeUndefined()
  })

  it('derives RESPONSE and carries both request and response', () => {
    const event = buildEvent({
      mcp: {
        gatewayRequest: { headers: { auth: 'x' } },
        gatewayResponse: { statusCode: 201, headers: {}, body: { ok: true } },
      },
    })
    expect(event.point).toBe('RESPONSE')
    expect(event.response?.statusCode).toBe(201)
    expect(event.request?.headers).toEqual({ auth: 'x' })
  })

  it('surfaces invocationIndex', () => {
    const event = buildEvent({ mcp: { gatewayResponse: { statusCode: 200 }, invocationIndex: 3 } })
    expect(event.invocationIndex).toBe(3)
  })
})

describe('sample builders', () => {
  it('sampleRequest builds a REQUEST event that round-trips', () => {
    const event = sampleRequest({ headers: { authorization: 'Bearer x' }, body: { q: 1 } })
    expect(event.point).toBe('REQUEST')
    expect(event.request?.headers).toEqual({ authorization: 'Bearer x' })
  })

  it('sampleRequest defaults headers and supports path/method', () => {
    const event = sampleRequest({ path: '/p', httpMethod: 'POST' })
    expect(event.request?.path).toBe('/p')
    expect(event.request?.httpMethod).toBe('POST')
    expect(event.request?.headers).toEqual({})
  })

  it('sampleResponse builds a RESPONSE event with request headers', () => {
    const event = sampleResponse({ statusCode: 403, body: { e: 1 }, requestHeaders: { a: 'b' } })
    expect(event.point).toBe('RESPONSE')
    expect(event.response?.statusCode).toBe(403)
    expect(event.request?.headers).toEqual({ a: 'b' })
  })

  it('sampleResponse applies defaults', () => {
    const event = sampleResponse()
    expect(event.response?.statusCode).toBe(200)
    expect(event.response?.headers).toEqual({})
  })
})
