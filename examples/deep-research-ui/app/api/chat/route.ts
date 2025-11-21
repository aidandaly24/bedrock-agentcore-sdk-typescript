/* eslint-disable no-undef */
/**
 * Deep Research API Route
 *
 * Streaming endpoint for the deep research agent.
 * Uses AI SDK's createAgentUIStreamResponse for streaming tool execution and results.
 *
 * NOTE: This is a Next.js example file. Copy this into your Next.js project.
 * The ESLint errors are expected because this SDK package doesn't include Next.js types.
 */

import { createAgentUIStreamResponse, type UIMessage } from 'ai'
import { deepResearchAgent } from '../../../lib/agents/deep-research-agent'

// Allow streaming responses for up to 60 seconds
export const maxDuration = 60

/**
 * POST /api/chat
 *
 * Handles deep research requests with streaming responses.
 *
 * Request body:
 * {
 *   messages: UIMessage[] // Conversation history
 * }
 *
 * Response:
 * - Streams UIMessage chunks with text and tool execution parts
 * - Tool parts are automatically named: tool-executeCode, tool-fileOperations, tool-executeCommand
 * - Compatible with useChat hook from @ai-sdk/react
 */
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    // Validate messages
    if (!Array.isArray(messages)) {
      return new Response('Invalid request: messages must be an array', {
        status: 400,
      })
    }

    // Create streaming response with the deep research agent
    return createAgentUIStreamResponse({
      agent: deepResearchAgent,
      messages,
    })
  } catch (error) {
    console.error('Error in deep research API:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
