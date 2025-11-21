/**
 * Generative UI Component for Code Execution Tool
 *
 * Displays code execution with syntax highlighting and formatted output
 */

interface CodeExecutionToolProps {
  toolCallId?: string
  input?: any
  output?: any
  state: string
}

export function CodeExecutionTool({ toolCallId, input, output, state }: CodeExecutionToolProps) {
  // Parse code from input
  const code = input?.code
  const language = input?.language || 'python'

  // Parse output - handle array format from Code Interpreter
  let displayOutput = output
  if (Array.isArray(output)) {
    displayOutput = output.map((item) => item.text || JSON.stringify(item)).join('\n')
  }

  return (
    <details className="group rounded-lg border border-emerald-700/50 bg-slate-950/60 shadow-lg">
      <summary className="cursor-pointer px-4 py-3 font-mono text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span>Code Execution</span>
        {toolCallId && <span className="ml-auto text-xs text-slate-600 font-normal">{toolCallId.substring(0, 8)}</span>}
        {state === 'input-available' && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        )}
      </summary>

      <div className="border-t border-emerald-700/30 p-4 space-y-4">
        {/* Code Input */}
        {code && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Code ({language})</div>
            </div>
            <div className="relative">
              <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200 font-mono border border-slate-700">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Execution Output */}
        {output && state === 'output-available' && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Output</div>
            <div className="relative">
              <pre className="max-h-64 overflow-auto rounded-lg bg-emerald-950/30 p-4 text-sm text-emerald-300 font-mono border border-emerald-700/50">
                {typeof displayOutput === 'string' ? displayOutput : JSON.stringify(displayOutput, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state === 'input-available' && !output && (
          <div className="flex items-center gap-2 text-yellow-500/80 text-sm">
            <div className="h-2 w-2 animate-bounce rounded-full bg-yellow-500" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-yellow-500" style={{ animationDelay: '0.1s' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-yellow-500" style={{ animationDelay: '0.2s' }} />
            <span className="ml-2">Executing code...</span>
          </div>
        )}
      </div>
    </details>
  )
}
