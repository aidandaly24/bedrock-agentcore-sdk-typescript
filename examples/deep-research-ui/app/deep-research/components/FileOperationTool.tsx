/**
 * Generative UI Component for File Operations Tool
 *
 * Displays file operations (read, write, list) with formatted output
 */

interface FileOperationToolProps {
  toolCallId?: string
  input?: any
  output?: any
  state: string
}

export function FileOperationTool({ toolCallId, input, output, state }: FileOperationToolProps) {
  // Parse operation details
  const operation = input?.operation || 'unknown'
  const path = input?.path || input?.filePath

  // Determine operation icon
  const getOperationIcon = (op: string) => {
    switch (op.toLowerCase()) {
      case 'read':
        return '📖'
      case 'write':
        return '✏️'
      case 'list':
        return '📋'
      case 'delete':
        return '🗑️'
      default:
        return '📁'
    }
  }

  return (
    <details className="group rounded-lg border border-blue-700/50 bg-slate-950/60 shadow-lg">
      <summary className="cursor-pointer px-4 py-3 font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
        <span className="text-lg">{getOperationIcon(operation)}</span>
        <span>File Operation: {operation}</span>
        {toolCallId && <span className="ml-auto text-xs text-slate-600 font-normal">{toolCallId.substring(0, 8)}</span>}
        {state === 'input-available' && (
          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        )}
      </summary>

      <div className="border-t border-blue-700/30 p-4 space-y-4">
        {/* Operation Input */}
        {input && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Operation Details</div>
            <div className="rounded-lg bg-slate-900 p-3 border border-slate-700">
              {path && (
                <div className="mb-2">
                  <span className="text-xs text-slate-500">Path:</span>
                  <span className="ml-2 text-sm text-slate-300 font-mono">{path}</span>
                </div>
              )}
              <pre className="text-xs text-slate-400 overflow-auto">{JSON.stringify(input, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Operation Output */}
        {output && state === 'output-available' && (
          <div>
            <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Result</div>
            <div className="relative">
              <pre className="max-h-64 overflow-auto rounded-lg bg-blue-950/30 p-4 text-sm text-blue-300 font-mono border border-blue-700/50">
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
            <span className="ml-2">Performing file operation...</span>
          </div>
        )}
      </div>
    </details>
  )
}
