# Deep Research UI

This directory contains a complete example of building a deep research agent UI using the AWS Bedrock AgentCore SDK with Next.js and Vercel AI SDK v6.

## Features

- **Deep Research Agent**: AI agent that conducts multi-step research using code execution
- **Streaming UI**: Real-time streaming of agent responses and tool executions
- **Tool Transparency**: Full visibility into code execution, file operations, and shell commands
- **Type-Safe**: Complete TypeScript typing with `InferAgentUIMessage`
- **Production-Ready**: Session management, error handling, and cleanup

## Architecture

```
┌─────────────────┐
│  Frontend       │  → useChat hook with streaming
│  page.tsx       │     (displays messages + tool calls)
└────────┬────────┘
         │
         ↓  POST /api/deep-research
┌─────────────────┐
│  API Route      │  → createAgentUIStreamResponse
│  route.ts       │     (handles streaming)
└────────┬────────┘
         │
         ↓  Uses
┌─────────────────┐
│  Agent          │  → ToolLoopAgent with 3 tools
│  agent.ts       │     (code, files, commands)
└────────┬────────┘
         │
         ↓  Executes on
┌─────────────────┐
│  AWS Bedrock    │  → Claude Sonnet 4
│  CodeInterpreter│     + Secure sandbox
└─────────────────┘
```

## Installation

### 1. Install Dependencies

```bash
npm install ai @ai-sdk/react @ai-sdk/amazon-bedrock @bedrock-agentcore/sdk
```

### 2. Set Environment Variables

Create `.env.local` in your Next.js project root:

```bash
# AWS Credentials
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Optional: AWS Session Token for temporary credentials
# AWS_SESSION_TOKEN=your_session_token
```

### 3. Copy Files to Your Next.js Project

```bash
# From this directory, copy to your Next.js project:
cp lib/agents/deep-research-agent.ts <your-nextjs-app>/lib/agents/
cp app/api/deep-research/route.ts <your-nextjs-app>/app/api/deep-research/
cp app/deep-research/page.tsx <your-nextjs-app>/app/deep-research/
```

## File Structure

```
your-nextjs-app/
├── lib/
│   └── agents/
│       └── deep-research-agent.ts    # Agent definition with tools
├── app/
│   ├── api/
│   │   └── deep-research/
│   │       └── route.ts              # Streaming API endpoint
│   └── deep-research/
│       └── page.tsx                  # UI page
└── .env.local                        # Environment variables
```

## Usage

### 1. Start Your Next.js Development Server

```bash
npm run dev
```

### 2. Navigate to the Deep Research Page

Open your browser to:

```
http://localhost:3000/deep-research
```

### 3. Ask Research Questions

Try these example questions:

- "Compare the computational complexity of quicksort vs mergesort with concrete examples"
- "Analyze a SaaS company with $50k MRR, 5% churn, and $500 CAC over 12 months"
- "Generate 1000 samples from a normal distribution and analyze outliers"
- "Write a Python script to scrape weather data and analyze temperature trends"

## How It Works

### Agent Definition (`lib/agents/deep-research-agent.ts`)

```typescript
export const deepResearchAgent = new ToolLoopAgent({
  model: bedrock('global.anthropic.claude-sonnet-4-20250514-v1:0'),
  instructions: `You are a senior research analyst...`,
  tools: {
    executeCode: executeCodeTool, // Python/JS/TS execution
    fileOperations: fileOperationsTool, // Read/write/list files
    executeCommand: executeCommandTool, // Shell commands
  },
})
```

The agent:

1. Receives a research question
2. Plans the approach
3. Executes code and commands as needed
4. Saves intermediate results to files
5. Synthesizes findings into a structured summary

### API Route (`app/api/deep-research/route.ts`)

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json()

  return createAgentUIStreamResponse({
    agent: deepResearchAgent,
    messages,
  })
}
```

- Handles POST requests with conversation history
- Returns streaming response with `createAgentUIStreamResponse`
- Automatically handles tool execution and result streaming

### Frontend Page (`app/deep-research/page.tsx`)

```typescript
const { messages, sendMessage, isLoading } = useChat<DeepResearchMessage>({
  api: '/api/deep-research',
})
```

- Uses `useChat` hook for streaming
- Type-safe with `InferAgentUIMessage<typeof deepResearchAgent>`
- Displays text responses and tool execution details
- Collapsible tool call viewers for transparency

## Tool Execution Flow

1. **User asks question** → Sent to `/api/deep-research`
2. **Agent receives question** → Plans approach
3. **Agent calls tool** → e.g., `executeCode` with Python script
4. **Tool executes** → Runs in secure CodeInterpreter sandbox
5. **Result streams back** → UI updates in real-time
6. **Agent continues** → May call more tools or provide final answer
7. **Final summary** → Structured research findings with TL;DR

## Message Types

The UI handles these message part types:

- `text`: Regular text responses from the agent
- `tool-executeCode`: Code execution details (input + result)
- `tool-fileOperations`: File operation details (operation + result)
- `tool-executeCommand`: Shell command details (command + output)

## Session Management

The agent maintains a persistent CodeInterpreter session:

```typescript
// Session starts on first request
await interpreter.startSession()

// Session persists across requests
// Files and installed packages remain available

// Session cleanup on server shutdown
process.on('SIGTERM', cleanupDeepResearchAgent)
```

## Customization

### Modify Agent Instructions

Edit `lib/agents/deep-research-agent.ts`:

```typescript
instructions: `
  Your custom instructions here...
  - Specific domain expertise
  - Output format preferences
  - Tool usage guidelines
`
```

### Add More Tools

Create new tools and add to the agent:

```typescript
import { createMyCustomTool } from './tools/my-custom-tool'

tools: {
  executeCode: executeCodeTool,
  fileOperations: fileOperationsTool,
  executeCommand: executeCommandTool,
  myCustomTool: createMyCustomTool(interpreter),
}
```

### Customize UI Styling

The page uses Tailwind CSS. Modify `app/deep-research/page.tsx` to match your design system.

## Troubleshooting

### "Region is required" Error

Set `AWS_REGION` in `.env.local`:

```bash
AWS_REGION=us-west-2
```

### "Access Denied" or "Model not found"

1. Enable Claude Sonnet 4 in AWS Bedrock console
2. Verify IAM permissions for Bedrock and CodeInterpreter
3. Check that your region supports the model

### Session Not Found

Sessions are automatically cleaned up. Make sure you're using the same interpreter instance across requests (singleton pattern in agent definition).

### Tool Calls Not Showing in UI

1. Check that your message type uses `InferAgentUIMessage<typeof deepResearchAgent>`
2. Verify tool parts match the tool names: `tool-executeCode`, etc.
3. Check browser console for TypeScript errors

## Best Practices

1. **Session Management**: Use a singleton CodeInterpreter instance for persistent sessions
2. **Error Handling**: Wrap agent calls in try-catch blocks in the API route
3. **Timeouts**: Set appropriate `maxDuration` for complex research tasks
4. **Cost Optimization**: Monitor token usage and implement rate limiting
5. **Security**: Never expose AWS credentials to the client side
6. **User Experience**: Show tool execution details for transparency

## Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard
2. Deploy with `vercel deploy`
3. Set `maxDuration` appropriately for your plan (60s for Pro)

### AWS

1. Use IAM roles for EC2/ECS instead of access keys
2. Set environment variables in deployment configuration
3. Implement proper session cleanup on shutdown

### Security Considerations

- Use IAM roles with least privilege
- Enable CloudWatch logging for debugging
- Implement rate limiting on the API route
- Validate user input before sending to agent
- Consider implementing authentication

## Learn More

- [AI SDK v6 Documentation](https://ai-sdk.dev/docs)
- [AWS Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Vercel AI SDK Guide](https://sdk.vercel.ai/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

## Support

For issues or questions:

- SDK Issues: [GitHub Issues](https://github.com/aws/bedrock-agentcore-sdk-typescript)
- AI SDK: [Vercel AI SDK Discord](https://discord.gg/vercel)
- AWS Bedrock: [AWS Support](https://aws.amazon.com/support/)
