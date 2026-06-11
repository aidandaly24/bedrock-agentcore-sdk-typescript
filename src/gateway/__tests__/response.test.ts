import { describe, it, expect } from 'vitest'
import { InterceptorResponse, toEnvelope } from '../response.js'
import { sampleRequest, sampleResponse } from '../event.js'

describe('InterceptorResponse constructors', () => {
  it('passThrough echoes the request at the REQUEST point', () => {
    const event = sampleRequest({ headers: { h: '1' }, body: { b: 2 } })
    const env = toEnvelope(InterceptorResponse.passThrough(event))
    expect(env.mcp.transformedGatewayRequest).toEqual({ headers: { h: '1' }, body: { b: 2 } })
  })

  it('passThrough echoes the response at the RESPONSE point', () => {
    const event = sampleResponse({ statusCode: 200, body: { r: 1 } })
    const env = toEnvelope(InterceptorResponse.passThrough(event))
    expect(env.mcp.transformedGatewayResponse?.statusCode).toBe(200)
    expect(env.mcp.transformedGatewayResponse?.body).toEqual({ r: 1 })
  })

  it('transformRequest builds a request envelope', () => {
    const env = toEnvelope(InterceptorResponse.transformRequest({ h: '1' }, { b: 2 }))
    expect(env.mcp.transformedGatewayRequest).toEqual({ headers: { h: '1' }, body: { b: 2 } })
  })

  it('transformResponse builds a response envelope', () => {
    const env = toEnvelope(InterceptorResponse.transformResponse(204, { h: '1' }, undefined))
    expect(env.mcp.transformedGatewayResponse?.statusCode).toBe(204)
  })

  it('deny defaults the Content-Type header', () => {
    const env = toEnvelope(InterceptorResponse.deny(403, { error: 'no' }))
    expect(env.mcp.transformedGatewayResponse?.statusCode).toBe(403)
    expect(env.mcp.transformedGatewayResponse?.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('deny accepts custom headers', () => {
    const env = toEnvelope(InterceptorResponse.deny(401, { error: 'no' }, { 'WWW-Authenticate': 'Bearer' }))
    expect(env.mcp.transformedGatewayResponse?.headers).toEqual({ 'WWW-Authenticate': 'Bearer' })
  })

  it('toEnvelope always stamps the version', () => {
    const env = toEnvelope(InterceptorResponse.transformRequest({}, undefined))
    expect(env.interceptorOutputVersion).toBe('1.0')
  })
})
