/* eslint-disable */
'use client'

/**
 * Deep Research UI Page
 *
 * Interactive chat interface for the deep research agent.
 * Shows streaming responses with tool execution details.
 *
 * NOTE: This is a Next.js example file. Copy this into your Next.js project.
 * The TypeScript/ESLint errors are expected because this SDK package doesn't include Next.js/React types.
 */

import { useState, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import type { InferAgentUIMessage } from 'ai'
import type { deepResearchAgent } from '@/lib/agents/deep-research-agent'
import { CodeExecutionTool } from './components/CodeExecutionTool'
import { FileOperationTool } from './components/FileOperationTool'
import { ShellCommandTool } from './components/ShellCommandTool'
import { BrowserNavigateTool } from './components/BrowserNavigateTool'
import { BrowserScreenshotTool } from './components/BrowserScreenshotTool'
import { BrowserClickTool } from './components/BrowserClickTool'
import { BrowserTypeTool } from './components/BrowserTypeTool'
import { BrowserGetTextTool } from './components/BrowserGetTextTool'
import { BrowserGetHtmlTool } from './components/BrowserGetHtmlTool'
import { BrowserEvaluateTool } from './components/BrowserEvaluateTool'

// Infer the message type from the agent definition
type DeepResearchMessage = InferAgentUIMessage<typeof deepResearchAgent>

export default function DeepResearchPage() {
  const [question, setQuestion] = useState('')

  const { messages, sendMessage, status } = useChat<DeepResearchMessage>()
  const isLoading = status === 'submitted' || status === 'streaming'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    await sendMessage({
      text: question,
    })
    setQuestion('')
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Deep Research Agent</h1>
          <p className="text-slate-400">Powered by AgentCore Code Interpreter + Browser</p>
          <p className="mt-2 text-sm text-slate-500">
            Ask complex questions. The agent will plan, execute code in a secure sandbox, browse the web, and return a
            structured research summary with full transparency.
          </p>
        </div>

        {/* Example Questions */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Example Questions</div>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => setQuestion('Visit example.com, take a screenshot, and analyze the page structure')}
              className="block w-full rounded-lg bg-slate-800/50 px-3 py-2 text-left hover:bg-slate-800"
            >
              🌐 Visit example.com and analyze page structure with screenshot
            </button>
            <button
              onClick={() =>
                setQuestion('Compare the computational complexity of quicksort vs mergesort with concrete examples')
              }
              className="block w-full rounded-lg bg-slate-800/50 px-3 py-2 text-left hover:bg-slate-800"
            >
              📊 Compare quicksort vs mergesort complexity with examples
            </button>
            <button
              onClick={() =>
                setQuestion(
                  'Visit news.ycombinator.com, extract the top 5 story titles, and analyze current tech trends'
                )
              }
              className="block w-full rounded-lg bg-slate-800/50 px-3 py-2 text-left hover:bg-slate-800"
            >
              📰 Scrape Hacker News top stories and analyze tech trends
            </button>
            <button
              onClick={() =>
                setQuestion(
                  'Generate 1000 samples from a normal distribution, analyze outliers, and create a visualization'
                )
              }
              className="block w-full rounded-lg bg-slate-800/50 px-3 py-2 text-left hover:bg-slate-800"
            >
              📈 Statistical analysis with outlier detection and visualization
            </button>
          </div>
        </div>

        {/* Messages Display */}
        <div className="mb-6 h-[55vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="mb-2 text-6xl">🔬</div>
                <div className="text-lg">Ask a research question to get started</div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="mb-6 last:mb-0">
              {/* Message Header */}
              <div className="mb-2 flex items-center gap-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {message.role === 'user' ? '👤 You' : '🤖 Research Agent'}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-3 rounded-xl bg-slate-900/80 px-4 py-3">
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
                        >
                          {part.text}
                        </div>
                      )

                    // File attachments
                    case 'file':
                      if (part.mediaType?.startsWith('image/')) {
                        return (
                          <div key={`${message.id}-${i}`} className="my-2">
                            <img
                              src={part.url}
                              alt={part.filename || 'Uploaded image'}
                              className="max-w-md rounded-lg border border-slate-700"
                            />
                            {part.filename && <div className="mt-1 text-xs text-slate-500">{part.filename}</div>}
                          </div>
                        )
                      }
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="my-2 rounded-lg border border-slate-700 bg-slate-900/60 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📎</span>
                            <span className="text-sm text-slate-300">{part.filename || 'Attached file'}</span>
                            {part.mediaType && <span className="text-xs text-slate-500">({part.mediaType})</span>}
                          </div>
                        </div>
                      )

                    // Tool execution: Code
                    case 'tool-executeCode':
                      return (
                        <CodeExecutionTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    // Tool execution: File Operations
                    case 'tool-fileOperations':
                      return (
                        <FileOperationTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    // Tool execution: Shell Command
                    case 'tool-executeCommand':
                      return (
                        <ShellCommandTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    // Browser Tools
                    case 'tool-navigate':
                      return (
                        <BrowserNavigateTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-screenshot':
                      return (
                        <BrowserScreenshotTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-click':
                      return (
                        <BrowserClickTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-type':
                      return (
                        <BrowserTypeTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-getText':
                      return (
                        <BrowserGetTextTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-getHtml':
                      return (
                        <BrowserGetHtmlTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    case 'tool-evaluate':
                      return (
                        <BrowserEvaluateTool
                          key={`${message.id}-${i}`}
                          toolCallId={part.toolCallId}
                          input={part.input}
                          output={part.output}
                          state={part.state}
                        />
                      )

                    default:
                      // Fallback for any future part types
                      return (
                        <div key={`${message.id}-${i}`} className="rounded bg-slate-800/60 px-3 py-2">
                          <pre className="text-xs text-slate-400">{JSON.stringify(part, null, 2)}</pre>
                        </div>
                      )
                  }
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '0.1s' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '0.2s' }} />
              <span className="ml-2 text-sm">Agent is researching...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-3">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Ask a deep research question…"
              value={question}
              onChange={(e) => setQuestion(e.currentTarget.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-medium transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {isLoading ? 'Researching…' : 'Send'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600">Powered by AgentCore Code Interpreter</div>
      </div>
    </div>
  )
}
