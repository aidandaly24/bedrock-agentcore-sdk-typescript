import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PlaywrightBrowser } from '../client.js'

// Mock the base Browser class
vi.mock('../../../client.js', () => {
  return {
    Browser: class MockBrowser {
      region: string
      identifier: string
      protected _session: any = null

      constructor(config: any) {
        this.region = config.region
        this.identifier = config.identifier || 'aws.browser.v1'
      }

      async startSession() {
        this._session = {
          sessionId: 'mock-session-id',
          sessionName: 'test-session',
          createdAt: new Date(),
        }
        return this._session
      }

      async stopSession() {
        this._session = null
      }

      async generateWebSocketUrl() {
        return {
          url: 'wss://mock-url',
          headers: { Authorization: 'mock-auth' },
        }
      }
    },
  }
})

// Mock Playwright
const mockPage = {
  goto: vi.fn(),
  click: vi.fn(),
  type: vi.fn(),
  $: vi.fn(),
  textContent: vi.fn(),
  content: vi.fn(),
  screenshot: vi.fn(),
  evaluate: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  reload: vi.fn(),
  keyboard: {
    press: vi.fn(),
  },
  context: vi.fn(() => ({
    cookies: vi.fn(),
    addCookies: vi.fn(),
  })),
}

const mockBrowser = {
  contexts: vi.fn(() => [
    {
      pages: vi.fn(() => [mockPage]),
    },
  ]),
  close: vi.fn(),
}

vi.mock('playwright', () => ({
  chromium: {
    connectOverCDP: vi.fn(() => Promise.resolve(mockBrowser)),
  },
}))

describe('PlaywrightBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('creates instance with region', () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      expect(browser.region).toBe('us-west-2')
    })

    it('inherits from Browser base class', () => {
      const browser = new PlaywrightBrowser({ region: 'us-east-1' })
      expect(browser.identifier).toBe('aws.browser.v1')
    })
  })

  describe('navigate', () => {
    it('navigates to URL with default waitUntil', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.navigate({ url: 'https://example.com' })

      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
        waitUntil: 'domcontentloaded',
        timeout: undefined,
      })
    })

    it('navigates with custom waitUntil and timeout', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.navigate({
        url: 'https://example.com',
        waitUntil: 'load',
        timeout: 30000,
      })

      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
        waitUntil: 'load',
        timeout: 30000,
      })
    })
  })

  describe('click', () => {
    it('clicks element by selector', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.click({ selector: 'button' })

      expect(mockPage.click).toHaveBeenCalledWith('button', {
        timeout: undefined,
      })
    })

    it('clicks with custom timeout', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.click({ selector: '#submit', timeout: 5000 })

      expect(mockPage.click).toHaveBeenCalledWith('#submit', {
        timeout: 5000,
      })
    })
  })

  describe('type', () => {
    it('types text into element', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.type({ selector: 'input', text: 'hello' })

      expect(mockPage.type).toHaveBeenCalledWith('input', 'hello', {
        delay: undefined,
        timeout: undefined,
      })
    })

    it('types with delay and timeout', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.type({
        selector: '#search',
        text: 'test',
        delay: 100,
        timeout: 5000,
      })

      expect(mockPage.type).toHaveBeenCalledWith('#search', 'test', {
        delay: 100,
        timeout: 5000,
      })
    })
  })

  describe('getText', () => {
    it('gets text from selector', async () => {
      const mockElement = {
        textContent: vi.fn().mockResolvedValue('Hello World'),
      }
      mockPage.$.mockResolvedValue(mockElement)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const text = await browser.getText({ selector: 'h1' })

      expect(mockPage.$).toHaveBeenCalledWith('h1')
      expect(text).toBe('Hello World')
    })

    it('gets all page text when no selector', async () => {
      mockPage.textContent.mockResolvedValue('Page content')

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const text = await browser.getText()

      expect(mockPage.textContent).toHaveBeenCalledWith('body')
      expect(text).toBe('Page content')
    })

    it('throws error when element not found', async () => {
      mockPage.$.mockResolvedValue(null)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await expect(browser.getText({ selector: '.missing' })).rejects.toThrow('Element not found: .missing')
    })
  })

  describe('getHtml', () => {
    it('gets HTML from selector', async () => {
      const mockElement = {
        innerHTML: vi.fn().mockResolvedValue('<div>content</div>'),
      }
      mockPage.$.mockResolvedValue(mockElement)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const html = await browser.getHtml({ selector: '#main' })

      expect(mockPage.$).toHaveBeenCalledWith('#main')
      expect(html).toBe('<div>content</div>')
    })

    it('gets full page HTML when no selector', async () => {
      mockPage.content.mockResolvedValue('<html>...</html>')

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const html = await browser.getHtml()

      expect(mockPage.content).toHaveBeenCalled()
      expect(html).toBe('<html>...</html>')
    })
  })

  describe('screenshot', () => {
    it('takes screenshot as buffer by default', async () => {
      const mockBuffer = globalThis.Buffer.from('screenshot')
      mockPage.screenshot.mockResolvedValue(mockBuffer)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const result = await browser.screenshot()

      expect(mockPage.screenshot).toHaveBeenCalledWith({
        path: undefined,
        fullPage: false,
        type: 'png',
      })
      expect(result).toBe(mockBuffer)
    })

    it('takes screenshot as base64', async () => {
      const mockBuffer = globalThis.Buffer.from('screenshot')
      mockPage.screenshot.mockResolvedValue(mockBuffer)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const result = await browser.screenshot({ encoding: 'base64' })

      expect(typeof result).toBe('string')
      expect(result).toBe(mockBuffer.toString('base64'))
    })

    it('takes full page screenshot with custom options', async () => {
      mockPage.screenshot.mockResolvedValue(globalThis.Buffer.from(''))

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.screenshot({
        path: '/tmp/screenshot.png',
        fullPage: true,
        type: 'jpeg',
      })

      expect(mockPage.screenshot).toHaveBeenCalledWith({
        path: '/tmp/screenshot.png',
        fullPage: true,
        type: 'jpeg',
      })
    })
  })

  describe('evaluate', () => {
    it('evaluates JavaScript code', async () => {
      mockPage.evaluate.mockResolvedValue({ title: 'Test Page' })

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const result = await browser.evaluate({ script: 'document.title' })

      expect(mockPage.evaluate).toHaveBeenCalledWith('document.title', undefined)
      expect(result).toEqual({ title: 'Test Page' })
    })

    it('evaluates with arguments', async () => {
      mockPage.evaluate.mockResolvedValue(42)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const result = await browser.evaluate({
        script: '(a, b) => a + b',
        args: [10, 32],
      })

      expect(mockPage.evaluate).toHaveBeenCalledWith('(a, b) => a + b', [10, 32])
      expect(result).toBe(42)
    })
  })

  describe('navigation methods', () => {
    it('navigates back', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.back()

      // Expect networkidle first (with fallback strategy)
      expect(mockPage.goBack).toHaveBeenCalledWith({
        waitUntil: 'networkidle',
        timeout: 30000,
      })
    })

    it('navigates forward', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.forward()

      // Expect networkidle first (with fallback strategy)
      expect(mockPage.goForward).toHaveBeenCalledWith({
        waitUntil: 'networkidle',
        timeout: 30000,
      })
    })

    it('refreshes page', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.refresh()

      expect(mockPage.reload).toHaveBeenCalled()
    })
  })

  describe('cookie operations', () => {
    it('gets cookies', async () => {
      const mockCookies = [{ name: 'session', value: 'abc123' }]
      const mockContext = {
        cookies: vi.fn().mockResolvedValue(mockCookies),
        addCookies: vi.fn(),
      }
      mockPage.context.mockReturnValue(mockContext)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const cookies = await browser.getCookies()

      expect(cookies).toEqual(mockCookies)
    })

    it('sets cookies', async () => {
      const mockContext = {
        cookies: vi.fn(),
        addCookies: vi.fn(),
      }
      mockPage.context.mockReturnValue(mockContext)

      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      const cookiesToSet = [
        {
          name: 'test',
          value: 'value',
          domain: 'example.com',
          path: '/',
        },
      ]

      await browser.setCookies({ cookies: cookiesToSet })

      expect(mockContext.addCookies).toHaveBeenCalledWith(cookiesToSet)
    })
  })

  describe('keyboard operations', () => {
    it('presses keyboard key', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })
      await browser.pressKey('Enter')

      expect(mockPage.keyboard.press).toHaveBeenCalledWith('Enter')
    })
  })

  describe('session management', () => {
    it('closes Playwright browser on stopSession', async () => {
      const browser = new PlaywrightBrowser({ region: 'us-west-2' })

      // Trigger connection
      await browser.navigate({ url: 'https://example.com' })

      // Stop session
      await browser.stopSession()

      expect(mockBrowser.close).toHaveBeenCalled()
    })
  })
})
