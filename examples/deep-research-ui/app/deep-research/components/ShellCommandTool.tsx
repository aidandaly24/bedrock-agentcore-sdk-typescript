/**
 * Generative UI Component for Shell Command Tool
 *
 * Displays shell command execution with terminal-like output
 */

interface ShellCommandToolProps {
  toolCallId?: string
  input?: any
  output?: any
  state: string
}

export function ShellCommandTool({ toolCallId, input, output, state }: ShellCommandToolProps) {
  const command = input?.command || input?.cmd

  return (
    <details className="group rounded-lg border border-purple-700/50 bg-slate-950/60 shadow-lg">
      <summary className="cursor-pointer px-4 py-3 font-mono text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
        <span className="text-lg">💻</span>
        <span>Shell Command</span>
        {toolCallId && <span className="ml-auto text-xs text-slate-600 font-normal">{toolCallId.substring(0, 8)}</span>}
        {state === 'input-available' && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        )}
      </summary>

      <div className="border-t border-purple-700/30 p-4 space-y-4">
        {/* Command Input */}
        {command && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Command</div>
            <div className="relative">
              <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-200 font-mono border border-slate-700">
                <span className="text-purple-400">$</span> {command}
              </pre>
            </div>
          </div>
        )}

        {/* Command Output */}
        {output && state === 'output-available' && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Output</div>
            <div className="relative">
              <pre className="max-h-64 overflow-auto rounded-lg bg-purple-950/30 p-4 text-sm text-purple-300 font-mono border border-purple-700/50">
                {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
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
            <span className="ml-2">Executing command...</span>
          </div>
        )}
      </div>
    </details>
  )
}
