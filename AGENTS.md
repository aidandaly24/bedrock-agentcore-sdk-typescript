# AWS Bedrock AgentCore SDK TypeScript - SDK Development Guide

> **📘 SOURCE OF TRUTH**: This document is the **authoritative guide** for SDK development. All implementation patterns, coding conventions, testing strategies, and best practices are defined here. When in doubt, refer to this document.

## Purpose and Scope

**AGENTS.md** contains agent-specific repository information including:
- Directory structure with summaries of what is included in each directory
- Development workflow instructions for agents to follow when developing features
- Coding patterns and testing patterns to follow when writing code
- Style guidelines, organizational patterns, and best practices

This guide is for AI agents and developers contributing to the AWS Bedrock AgentCore SDK TypeScript codebase.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Browser Automation Patterns](#browser-automation-patterns)
- [Coding Patterns](#coding-patterns)
- [Testing Patterns](#testing-patterns)
- [Code Style](#code-style)
- [Error Handling](#error-handling)
- [Things to Do](#things-to-do)
- [Things NOT to Do](#things-not-to-do)
- [Agent-Specific Notes](#agent-specific-notes)
- [Troubleshooting](#troubleshooting)

## Directory Structure

```
bedrock-agentcore-sdk-typescript/
├── src/
│   ├── tools/
│   │   ├── browser/
│   │   │   ├── __tests__/
│   │   │   │   ├── client.test.ts    # Base client tests
│   │   │   │   └── types.test.ts     # Type validation tests
│   │   │   ├── integrations/
│   │   │   │   ├── playwright/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── client.test.ts
│   │   │   │   │   ├── client.ts     # Playwright browser implementation
│   │   │   │   │   ├── types.ts      # Playwright-specific types
│   │   │   │   │   └── index.ts
│   │   │   │   ├── vercel-ai/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── tool.test.ts
│   │   │   │   │   ├── tool.ts       # Vercel AI SDK wrapper
│   │   │   │   │   ├── config.ts     # Framework-specific config
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── client.ts             # Framework-agnostic base client
│   │   │   ├── types.ts              # Browser action types
│   │   │   └── index.ts              # Export client + integrations
│   │   │
│   │   ├── code-interpreter/
│   │   │   ├── __tests__/
│   │   │   │   ├── client.test.ts
│   │   │   │   └── types.test.ts
│   │   │   ├── integrations/
│   │   │   │   ├── vercel-ai/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── tool.test.ts
│   │   │   │   │   ├── tool.ts
│   │   │   │   │   ├── config.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   └── index.ts                      # Main package entry point
│
├── examples/
│   ├── vercel-ai/
│   │   ├── browser-basic.ts
│   │   └── code-interpreter-basic.ts
│   └── direct-client/
│       ├── browser-usage.ts
│       └── code-interpreter-usage.ts
│
├── package.json
├── tsconfig.json
└── AGENTS.md                         # This file
```

### Directory Purposes

- **`src/`**: All production code lives here with co-located unit tests
- **`src/core/`**: Core types, utilities, and base functionality shared across tools
- **`src/tools/{tool}/`**: Tool-specific implementations (browser, code-interpreter, etc.)
- **`src/tools/{tool}/client.ts`**: Framework-agnostic base client for the tool
- **`src/tools/{tool}/types.ts`**: Shared types and Zod schemas for the tool
- **`src/tools/{tool}/integrations/`**: Framework-specific wrappers (Vercel AI, LangChain, etc.)
- **`__tests__/`**: Co-located unit tests next to source files
- **`examples/`**: Example applications demonstrating SDK usage

**IMPORTANT**: After making changes that affect the directory structure (adding new directories, moving files, or adding significant new files), you MUST update this directory structure section to reflect the current state of the repository.

## Development Workflow

### For AI Agents

1. **Read Context**: Review CLAUDE.md for design decisions
2. **Check Existing Code**: Search for similar patterns before implementing
3. **Follow Patterns**: Use established patterns from existing code
4. **Write Tests**: Create tests in `__tests__/` directories
5. **Document**: Add TSDoc comments for exported functions
6. **Validate**: Run tests and linting before committing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/browser-client-implementation

# Make changes with atomic commits
git add src/tools/browser/client.ts
git commit -m "feat: implement BrowserClient base class"

# Run quality gates
npm run test
npm run lint
npm run type-check

# Push and create PR
git push origin feature/browser-client-implementation
```

### Quality Gates

All code must pass:
- ✅ TypeScript type checking (`npm run type-check`)
- ✅ ESLint rules (`npm run lint`)
- ✅ Unit tests (`npm run test`)
- ✅ Build process (`npm run build`)

## Architecture Overview

### Three-Layer Architecture

The SDK follows a layered integration pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER APPLICATION                              │
│  (Using Vercel AI, LangChain, LlamaIndex, or custom framework)  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ imports
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│          INTEGRATION LAYER (Framework-Specific)                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Vercel AI     │  │  LangChain     │  │  LlamaIndex    │   │
│  │  Integration   │  │  Integration   │  │  Integration   │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │
│           │                   │                   │             │
│           │ wraps             │ wraps             │ wraps       │
│           ▼                   ▼                   ▼             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         BASE CLIENT LAYER (Framework-Agnostic)         │    │
│  │  • BrowserClient                                       │    │
│  │  • CodeInterpreterClient                               │    │
│  │  • MemoryClient (future)                               │    │
│  └────────────────────┬───────────────────────────────────┘    │
└───────────────────────┼────────────────────────────────────────┘
                        │ uses
                        │
┌───────────────────────▼────────────────────────────────────────┐
│                    AWS SDK LAYER                                │
│  • @aws-sdk/client-bedrock-agent-runtime                        │
│  • @aws-sdk/client-bedrock-agentcore                            │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Base clients are framework-agnostic**: Can be used directly or wrapped
2. **Integrations translate**: Convert between framework types and AWS types
3. **Clear separation**: Each framework gets its own subdirectory
4. **Testability**: Mock at client layer, not AWS SDK layer

## Browser Automation Patterns

### Explicit Waits (Required)

**ALWAYS use explicit waits** before interacting with elements. Never assume elements are immediately available.

```typescript
// ✅ Good: Wait for element before interaction
await browser.waitForSelector({
  selector: '#submit-button',
  state: 'visible',
  timeout: 30000,
})
await browser.click({ selector: '#submit-button' })

// ❌ Bad: No wait, causes race conditions
await browser.click({ selector: '#submit-button' })
```

**Rationale**: Progressive page loading means HTML may be present but JavaScript is still modifying the DOM. Explicit waits prevent race conditions with dynamic content.

### Form Input: fill() vs type()

**Use `fill()` for form inputs**, not `type()`. The `fill()` method clears existing values and sets the new value atomically.

```typescript
// ✅ Good: Clear and set value atomically
await browser.fill({
  selector: '#email',
  value: 'user@example.com',
  timeout: 30000,
})

// ❌ Bad: Character-by-character typing is slow and unreliable
await browser.type({
  selector: '#email',
  text: 'user@example.com',
  delay: 100,
})
```

**When to use `type()`**: Only when simulating realistic human typing behavior is required (e.g., testing keystroke handlers, autocomplete).

### Navigation with Fallback Strategies

Back/forward navigation should use intelligent fallback strategies to handle different page loading patterns:

```typescript
async back(): Promise<void> {
  try {
    // Try networkidle (best for dynamic sites)
    await this._playwrightPage.goBack({ waitUntil: 'networkidle', timeout: 30000 })
  } catch {
    try {
      // Fallback to load event
      await this._playwrightPage.goBack({ waitUntil: 'load', timeout: 30000 })
    } catch {
      // Ultimate fallback: trigger navigation without waiting
      await this._playwrightPage.evaluate('window.history.back()')
    }
  }
}
```

**Rationale**: Sites with heavy tracking scripts and ads may never reach `networkidle`. The fallback strategy handles clean pages, slow pages, and problematic pages gracefully.

### Element Visibility Checks

**Check visibility before interaction** when dealing with conditional UI elements:

```typescript
// ✅ Good: Check visibility first
const isVisible = await browser.isVisible({ selector: '#modal' })
if (isVisible) {
  await browser.click({ selector: '#modal .close-button' })
}

// ❌ Bad: Direct interaction without checking
try {
  await browser.click({ selector: '#modal .close-button' })
} catch (error) {
  // Element may not exist
}
```

### Session Management and Cleanup

**Always clean up sessions** in finally blocks to prevent resource leaks:

```typescript
// ✅ Good: Cleanup in finally block
const browser = new PlaywrightBrowser({ region: 'us-east-1' })
try {
  await browser.startSession()
  await browser.navigate({ url: 'https://example.com' })
  // ... browser operations
} finally {
  await browser.stopSession()
}

// ❌ Bad: No cleanup on error
const browser = new PlaywrightBrowser({ region: 'us-east-1' })
await browser.startSession()
await browser.navigate({ url: 'https://example.com' })
await browser.stopSession()
```

### Integration Test Patterns

Integration tests should follow these patterns:

```typescript
describe('PlaywrightBrowser Integration', () => {
  let browser: PlaywrightBrowser

  beforeAll(async () => {
    browser = new PlaywrightBrowser({ region: 'us-west-2' })
    await browser.startSession({ sessionName: 'test-session' })
  })

  afterAll(async () => {
    await browser.stopSession()
  })

  it('searches for content', async () => {
    // Navigate
    await browser.navigate({
      url: 'https://example.com',
      waitUntil: 'load',
      timeout: 60000,
    })

    // Wait for search input to be ready
    await browser.waitForSelector({
      selector: '#search-input',
      state: 'visible',
      timeout: 60000,
    })

    // Fill search box
    await browser.fill({
      selector: '#search-input',
      value: 'TypeScript',
      timeout: 60000,
    })

    // Submit search
    await browser.pressKey('Enter')

    // Wait for results to appear
    await browser.waitForSelector({
      selector: '#results',
      state: 'visible',
      timeout: 60000,
    })

    // Verify results
    const html = await browser.getHtml()
    expect(html).toContain('TypeScript')
  }, 90000)
})
```

**Key principles**:
- Use `beforeAll`/`afterAll` for session management (not `beforeEach`/`afterEach`)
- Set generous timeouts for real website interactions (60s+)
- Wait for each element before interaction
- Use `fill()` instead of `type()` for form inputs
- Set test timeout longer than sum of operation timeouts

## Coding Patterns

### Import Organization

Organize imports in this order:

```typescript
// 1. Node.js built-ins
import { performance } from 'perf_hooks'
import crypto from 'crypto'

// 2. External dependencies
import { z } from 'zod'
import { tool } from 'ai'

// 3. AWS SDK imports
import {
  BedrockAgentRuntimeClient,
  StartBrowserSessionCommand,
  StopBrowserSessionCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'

// 4. Internal imports (relative paths)
import type { BrowserAction } from './types'
import { BrowserClient } from './client'
import type { ToolResult } from '../../core/types'
```

### File Organization

Structure each file in this order:

1. Imports
2. Type definitions (interfaces, types)
3. Constants
4. Exported functions/classes
5. Helper functions (non-exported)

### Function Ordering

Within a class or module:

1. **Constructor** (for classes)
2. **Public methods** (ordered from general to specific)
3. **Private methods** (ordered from general to specific)
4. **Static methods** (if any)

Example:

```typescript
export class BrowserClient {
  // 1. Private fields
  private _controlPlaneClient: BedrockAgentRuntimeClient
  private _dataPlaneClient: BedrockAgentRuntimeClient
  private _sessions: Map<string, BrowserSessionInfo> = new Map()

  // 2. Constructor
  constructor(config: BrowserClientConfig) {
    // ...
  }

  // 3. Public methods (general to specific)
  async startSession(params: StartSessionParams): Promise<SessionInfo> {
    // ...
  }

  async stopSession(sessionName: string): Promise<void> {
    // ...
  }

  async navigate(params: NavigateParams): Promise<ActionResult> {
    // ...
  }

  async click(params: ClickParams): Promise<ActionResult> {
    // ...
  }

  // 4. Private methods (general to specific)
  private _getSession(sessionName: string): BrowserSessionInfo {
    // ...
  }

  private _generateSessionName(): string {
    // ...
  }
}
```

### TypeScript Type Safety

**ALWAYS use strict typing:**

```typescript
// ✅ Good: Explicit return types
export async function startSession(
  params: StartSessionParams
): Promise<SessionInfo> {
  // ...
}

// ❌ Bad: Inferred return type
export async function startSession(params: StartSessionParams) {
  // ...
}
```

**NEVER use `any`:**

```typescript
// ✅ Good: Use proper types or `unknown`
function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null) {
    // Type guard
    return transformData(data as RawData)
  }
  throw new Error('Invalid data')
}

// ❌ Bad: Using `any`
function processData(data: any): ProcessedData {
  return transformData(data)
}
```

### Class Field Naming

Use underscore prefix for **private fields only**:

```typescript
export class BrowserClient {
  // ✅ Good: Private fields with underscore
  private _client: BedrockAgentRuntimeClient
  private _sessions: Map<string, SessionInfo>

  // ✅ Good: Public fields without underscore (rare)
  readonly region: string

  constructor(config: BrowserClientConfig) {
    this._client = new BedrockAgentRuntimeClient({ region: config.region })
    this._sessions = new Map()
    this.region = config.region
  }

  private _getSession(name: string): SessionInfo {
    return this._sessions.get(name)!
  }
}
```

### TSDoc Documentation

**TSDoc format** (required for all exported functions, classes, and interfaces):

```typescript
/**
 * Brief description of what the function does.
 *
 * @param paramName - Description of the parameter
 * @param optionalParam - Description of optional parameter
 * @returns Description of what is returned
 *
 * @example
 * ```typescript
 * const result = functionName('input')
 * console.log(result) // "output"
 * ```
 */
export function functionName(paramName: string, optionalParam?: number): string {
  // Implementation
}
```

**Interface property documentation**:

```typescript
/**
 * Interface description.
 */
export interface MyConfig {
  /**
   * Single-line description of the property.
   */
  propertyName: string

  /**
   * Single-line description with optional reference link.
   * @see https://docs.example.com/property-details
   */
  anotherProperty?: number
}
```

**Requirements**:
- All exported functions, classes, and interfaces must have TSDoc
- Include `@param` for all parameters
- Include `@returns` for return values
- Include `@example` only for exported classes (main SDK entry points like BrowserClient, CodeInterpreterClient)
- Do NOT include `@example` for type definitions, interfaces, or internal types
- Interface properties MUST have single-line descriptions
- Interface properties MAY include an optional `@see` link for additional details
- TSDoc validation enforced by ESLint

### Interface/Type Organization

Order type definitions from **top-level to dependencies**:

```typescript
// 1. Top-level interface (what users interact with)
export interface BrowserClientConfig {
  region: string
  identifier?: string
}

// 2. Session-related types
export interface BrowserSessionInfo {
  sessionId: string
  description?: string
}

export interface StartSessionParams {
  sessionName?: string
  description?: string
  timeout?: number
}

// 3. Operation-specific types
export interface NavigateParams {
  sessionName: string
  url: string
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
}

export interface ClickParams {
  sessionName: string
  selector: string
  timeout?: number
}

// 4. Result types
export interface ActionResult {
  success: boolean
  error?: string
}
```

### Discriminated Union Naming

For action-based discriminated unions, **action value must match operation name**:

```typescript
// ✅ Good: Action matches operation (snake_case from Python SDK)
export const BrowserActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('init_session'),  // Matches Python SDK
    session_name: z.string().optional(),
  }),
  z.object({
    action: z.literal('navigate'),      // Matches Python SDK
    session_name: z.string(),
    url: z.string().url(),
  }),
  z.object({
    action: z.literal('execute_code'),  // Matches Python SDK
    code: z.string(),
    language: z.enum(['python', 'javascript', 'typescript']),
  }),
])

// ❌ Bad: Action doesn't match operation
export const BrowserActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('start'),  // Should be 'init_session'
    session_name: z.string().optional(),
  }),
])
```

**Rationale**: Consistency with Python SDK, clear mapping between action value and operation.

## Testing Patterns

### Test Location

Tests are **co-located** with source files in `__tests__/` directories:

```
src/tools/browser/
├── __tests__/
│   ├── client.test.ts
│   └── types.test.ts
├── client.ts
└── types.ts
```

### Test Organization

Use **nested describe blocks** to organize tests:

```typescript
describe('BrowserClient', () => {
  describe('constructor', () => {
    it('creates client with default identifier', () => {
      const client = new BrowserClient({ region: 'us-east-1' })
      expect(client).toBeDefined()
    })

    it('creates client with custom identifier', () => {
      const client = new BrowserClient({
        region: 'us-east-1',
        identifier: 'custom.browser.v1',
      })
      expect(client).toBeDefined()
    })
  })

  describe('startSession', () => {
    let client: BrowserClient

    beforeEach(() => {
      client = new BrowserClient({ region: 'us-east-1' })
    })

    describe('when sessionName is provided', () => {
      it('uses the provided session name', async () => {
        const result = await client.startSession({
          sessionName: 'my-session',
        })
        expect(result.sessionName).toBe('my-session')
      })
    })

    describe('when sessionName is omitted', () => {
      it('generates a session name', async () => {
        const result = await client.startSession({})
        expect(result.sessionName).toMatch(/^browser-\d+/)
      })
    })
  })

  describe('navigate', () => {
    let client: BrowserClient
    let sessionName: string

    beforeEach(async () => {
      client = new BrowserClient({ region: 'us-east-1' })
      const session = await client.startSession({})
      sessionName = session.sessionName
    })

    describe('when called with valid URL', () => {
      it('returns success result', async () => {
        const result = await client.navigate({
          sessionName,
          url: 'https://example.com',
        })
        expect(result.success).toBe(true)
      })
    })

    describe('when called with invalid URL', () => {
      it('returns error result', async () => {
        const result = await client.navigate({
          sessionName,
          url: 'invalid-url',
        })
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })
})
```

### Test Batching Strategy

**Rule**: When test setup cost exceeds test logic cost, you MUST batch related assertions into a single test.

**You MUST batch when**:
- Setup complexity > test logic complexity
- Multiple assertions verify the same object state
- Related behaviors share expensive context

**You SHOULD keep separate tests for**:
- Distinct behaviors or execution paths
- Error conditions
- Different input scenarios

```typescript
// ✅ Good: Batch when setup is expensive
describe('CodeInterpreterClient', () => {
  describe('executeCode', () => {
    it('executes Python code and returns output', async () => {
      const client = new CodeInterpreterClient({ region: 'us-east-1' })
      const session = await client.startSession({})

      const result = await client.executeCode({
        sessionName: session.sessionName,
        code: 'print("Hello, World!")',
        language: 'python',
      })

      // Multiple assertions in one test (batched)
      expect(result.status).toBe('success')
      expect(result.output).toContain('Hello, World!')
      expect(result.exitCode).toBe(0)
      expect(result.error).toBeUndefined()

      await client.stopSession(session.sessionName)
    })
  })
})

// ❌ Bad: Separate tests when setup is expensive
describe('CodeInterpreterClient', () => {
  describe('executeCode', () => {
    it('returns success status', async () => {
      const client = new CodeInterpreterClient({ region: 'us-east-1' })
      const session = await client.startSession({})
      const result = await client.executeCode({...})
      expect(result.status).toBe('success')
      await client.stopSession(session.sessionName)
    })

    it('returns correct output', async () => {
      // Duplicate expensive setup
      const client = new CodeInterpreterClient({ region: 'us-east-1' })
      const session = await client.startSession({})
      const result = await client.executeCode({...})
      expect(result.output).toContain('Hello, World!')
      await client.stopSession(session.sessionName)
    })
  })
})
```

### Mock Providers

Create reusable mock providers for testing:

```typescript
// __tests__/mocks/aws-sdk.ts
export function createMockBedrockClient() {
  return {
    send: jest.fn().mockImplementation((command) => {
      if (command instanceof StartBrowserSessionCommand) {
        return Promise.resolve({ sessionId: 'mock-session-id' })
      }
      if (command instanceof InvokeBrowserActionCommand) {
        return Promise.resolve({ success: true })
      }
      return Promise.reject(new Error('Unknown command'))
    }),
  }
}

// client.test.ts
import { createMockBedrockClient } from './mocks/aws-sdk'

describe('BrowserClient', () => {
  it('starts session successfully', async () => {
    const mockClient = createMockBedrockClient()
    const client = new BrowserClient({ region: 'us-east-1' })
    // Inject mock (implementation detail depends on your dependency injection)
  })
})
```

### Object Assertions

**Test entire objects rather than individual properties** when the object structure is important:

```typescript
// ✅ Good: Test entire object structure
it('returns complete session info', async () => {
  const result = await client.startSession({
    sessionName: 'test-session',
    description: 'Test description',
  })

  expect(result).toEqual({
    sessionName: 'test-session',
    sessionId: expect.stringMatching(/^session-/),
  })
})

// ❌ Bad: Test properties individually when structure matters
it('returns session name and id', async () => {
  const result = await client.startSession({...})
  expect(result.sessionName).toBe('test-session')
  expect(result.sessionId).toBeDefined()
  // Missing: Doesn't verify no unexpected properties
})
```

## Code Style

### General Style

- **No semicolons** (use ESLint to enforce)
- **Single quotes** for strings (except when avoiding escapes)
- **Trailing commas** in multiline structures
- **120 character** line length limit
- **2 spaces** for indentation

```typescript
// ✅ Good
const config = {
  region: 'us-east-1',
  identifier: 'aws.browser.v1',
  timeout: 900,
}

// ❌ Bad
const config = {
  region: "us-east-1",
  identifier: "aws.browser.v1",
  timeout: 900
};
```

### Async/Await

**Always use async/await**, never raw Promises:

```typescript
// ✅ Good
async function startSession(params: StartSessionParams): Promise<SessionInfo> {
  const response = await this._client.send(new StartBrowserSessionCommand({...}))
  return { sessionId: response.sessionId! }
}

// ❌ Bad
function startSession(params: StartSessionParams): Promise<SessionInfo> {
  return this._client.send(new StartBrowserSessionCommand({...}))
    .then(response => ({ sessionId: response.sessionId! }))
}
```

## Error Handling

### Error Creation

Use descriptive error messages with context:

```typescript
// ✅ Good: Descriptive error with context
private _getSession(sessionName: string): BrowserSessionInfo {
  const session = this._sessions.get(sessionName)
  if (!session) {
    throw new Error(
      `Session '${sessionName}' not found. Call startSession() first. ` +
      `Active sessions: ${Array.from(this._sessions.keys()).join(', ')}`
    )
  }
  return session
}

// ❌ Bad: Generic error without context
private _getSession(sessionName: string): BrowserSessionInfo {
  const session = this._sessions.get(sessionName)
  if (!session) {
    throw new Error('Session not found')
  }
  return session
}
```

### Error Handling in Client Methods

**Catch AWS SDK errors and translate to user-friendly messages**:

```typescript
async navigate(params: NavigateParams): Promise<ActionResult> {
  const session = this._getSession(params.sessionName)

  try {
    await this._dataPlaneClient.send(
      new InvokeBrowserActionCommand({
        sessionId: session.sessionId,
        action: 'navigate',
        parameters: {
          url: params.url,
          waitUntil: params.waitUntil || 'load',
        },
      })
    )

    return { success: true }
  } catch (error) {
    // Translate AWS SDK errors to user-friendly messages
    let errorMessage = 'Unknown error'

    if (error instanceof Error) {
      // Extract meaningful error message
      if (error.name === 'ResourceNotFoundException') {
        errorMessage = `Browser session not found: ${params.sessionName}`
      } else if (error.name === 'TimeoutException') {
        errorMessage = `Navigation to ${params.url} timed out`
      } else {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
```

## Things to Do

### ✅ DO

1. **Read CLAUDE.md** before implementing new features
2. **Use established patterns** from existing code
3. **Write tests** for all new code in `__tests__/` directories
4. **Add TSDoc** for all exported functions and classes
5. **Use strict TypeScript** (no `any`, explicit return types)
6. **Follow import order** (Node built-ins → external → AWS SDK → internal)
7. **Order functions** (public before private, general before specific)
8. **Use discriminated unions** for action-based APIs
9. **Prefix private fields** with underscore (`_field`)
10. **Batch test assertions** when setup is expensive
11. **Test entire objects** when structure matters
12. **Handle errors gracefully** with context-rich messages
13. **Use async/await** instead of raw Promises
14. **Reuse clients** instead of creating new instances
15. **Clean up resources** (sessions, connections) in finally blocks

### ❌ DON'T

1. **Don't create** new architecture patterns without discussion
2. **Don't use `any`** - use proper types or `unknown` with type guards
3. **Don't mix** framework-agnostic and framework-specific code
4. **Don't create** new clients repeatedly - reuse instances
5. **Don't leave** sessions or resources uncleaned
6. **Don't write** generic error messages - include context
7. **Don't use** raw Promises - use async/await
8. **Don't skip** TSDoc for exported APIs
9. **Don't name** private fields without underscore prefix
10. **Don't create** separate test files for small helpers
11. **Don't test** individual properties when object structure matters
12. **Don't duplicate** expensive setup in tests - batch assertions
13. **Don't hardcode** AWS regions - use configuration
14. **Don't skip** cleanup in finally blocks
15. **Don't commit** code that fails linting or type checking

## Agent-Specific Notes

### Writing Code

- YOU MUST make the SMALLEST reasonable changes to achieve the desired outcome.
- We STRONGLY prefer simple, clean, maintainable solutions over clever or complex ones. Readability and maintainability are PRIMARY CONCERNS, even at the cost of conciseness or performance.
- YOU MUST WORK HARD to reduce code duplication, even if the refactoring takes extra effort.
- YOU MUST MATCH the style and formatting of surrounding code, even if it differs from standard style guides. Consistency within a file trumps external standards.
- YOU MUST NOT manually change whitespace that does not affect execution or output. Otherwise, use a formatting tool.
- Fix broken things immediately when you find them. Don't ask permission to fix bugs.
- **Always search** for similar patterns in the codebase first
- **Follow the three-layer pattern**: User App → Integration → Base Client → AWS SDK
- **Maintain consistency** with Python SDK where applicable (e.g., action names)
- **Think about testability**: Design for easy mocking and testing

### Code Comments

- NEVER add comments explaining that something is "improved", "better", "new", "enhanced", or referencing what it used to be
- Comments should explain WHAT the code does or WHY it exists, not how it's better than something else
- YOU MUST NEVER add comments about what used to be there or how something has changed.
- YOU MUST NEVER refer to temporal context in comments (like "recently refactored" "moved") or code. Comments should be evergreen and describe the code as it is.
- YOU MUST NEVER write overly verbose comments. Use concise language.
- **TSDoc for public APIs**: Required for all exported functions and classes
- **Inline comments**: Only for complex logic that isn't obvious
- **Explain why, not what**: Focus on reasoning, not mechanics

```typescript
// ✅ Good: Explains reasoning
// Reuse default CDP context instead of creating redundant context
// to match Python SDK behavior and avoid unnecessary resource overhead
const browserContext = browser.contexts()[0]

// ❌ Bad: States the obvious
// Get the first browser context
const browserContext = browser.contexts()[0]

// ❌ Bad: References temporal context
// Recently refactored to use default context
const browserContext = browser.contexts()[0]

// ❌ Bad: References what it used to be
// Changed from creating new context to reusing default
const browserContext = browser.contexts()[0]
```

### When Implementing New Features

1. **Follow existing patterns** for similar features
2. **Create base client first** (framework-agnostic)
3. **Then create integrations** (framework-specific wrappers)
4. **Write tests** for both base client and integrations
5. **Add examples** in `examples/` directory
6. **Update exports** in `index.ts` files

### When Reviewing Code

1. **Check type safety**: No `any`, explicit return types
2. **Verify error handling**: Graceful degradation with context
3. **Confirm test coverage**: Tests in `__tests__/` directories
4. **Check documentation**: TSDoc for exported APIs
5. **Validate patterns**: Follows established conventions

## Troubleshooting

### Common Issues

**Issue**: Tests failing with "Session not found"
**Solution**: Ensure session is created in `beforeEach` and cleaned up in `afterEach`

**Issue**: TypeScript errors about missing types
**Solution**: Run `npm install` to update `@types` packages

**Issue**: ESLint errors about semicolons
**Solution**: Run `npm run lint -- --fix` to auto-fix

**Issue**: AWS SDK errors in tests
**Solution**: Use mock providers from `__tests__/mocks/` directory

**Issue**: Integration tests failing
**Solution**: Check AWS credentials and region configuration

### Debug Strategies

1. **Check AWS SDK calls**: Log commands before sending
2. **Verify session state**: Log active sessions with `listSessions()`
3. **Test with base client**: Isolate framework integration issues
4. **Use mock clients**: Test logic without AWS calls
5. **Check error messages**: AWS SDK errors contain useful context

### Getting Help

1. **Search codebase**: Look for similar implementations
2. **Check tests**: Examples of how code should be used
3. **Review examples**: Working code in `examples/` directory
4. **Consult Python SDK**: Reference implementation patterns
5. **Review AGENTS.md**: This document contains all development patterns

---

## Summary

This guide provides patterns and conventions for developing the AWS Bedrock AgentCore SDK TypeScript. Follow these guidelines to maintain consistency, quality, and testability across the codebase.

**Key Takeaways**:
- Three-layer architecture (User App → Integration → Base Client → AWS SDK)
- Framework-agnostic base clients with framework-specific integrations
- Co-located tests with nested describe blocks
- Strict TypeScript with no `any` and explicit return types
- TSDoc for all exported APIs
- Consistent error handling with context-rich messages
- Test batching when setup is expensive
- Clean up resources in finally blocks

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official TypeScript documentation
- [Vitest Documentation](https://vitest.dev/) - Modern unit testing framework
- [TSDoc Reference](https://tsdoc.org/) - TypeScript documentation standard
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message conventions
- [Strands Agents Documentation](https://github.com/strands-agents) - Reference implementation patterns
- [AWS Bedrock AgentCore Python SDK](https://github.com/aws/bedrock-agentcore-sdk-python) - Python SDK reference
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs) - Framework integration reference
