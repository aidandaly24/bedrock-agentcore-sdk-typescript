/**
 * Deep Research Agent Definition
 *
 * This agent uses AWS Bedrock Claude with CodeInterpreter and Browser for complex research tasks.
 * It has access to code execution, file operations, shell commands, and web browsing.
 */

import { ToolLoopAgent } from 'ai'
import { bedrock } from '@ai-sdk/amazon-bedrock'
import { CodeInterpreterTools } from '@bedrock-agentcore/sdk/code-interpreter/vercel-ai'
import { BrowserTools } from '@bedrock-agentcore/sdk/browser/vercel-ai'

// Initialize CodeInterpreter tools - provides code execution, file ops, and shell commands
export const codeInterpreter = new CodeInterpreterTools()

// Initialize Browser tools - provides web browsing and automation
export const browser = new BrowserTools()

// Sessions will be automatically started on first tool use
// No need to start them explicitly here

/**
 * Deep Research Agent
 *
 * A senior research analyst with access to a persistent code interpreter sandbox and web browser.
 *
 * Capabilities:
 * - Execute Python, JavaScript, and TypeScript code
 * - Manage files in the sandbox (read, write, list, remove)
 * - Run shell commands for system operations
 * - Install packages and libraries as needed
 * - Browse websites and extract information
 * - Take screenshots and interact with web pages
 * - Conduct multi-step research workflows
 *
 * Research Process:
 * 1. Break down the question into sub-questions
 * 2. Plan the research approach
 * 3. Execute code for computations and analysis
 * 4. Browse websites for data gathering
 * 5. Save intermediate results to files
 * 6. Synthesize findings into a structured summary
 */
export const deepResearchAgent = new ToolLoopAgent({
  model: bedrock('global.anthropic.claude-sonnet-4-20250514-v1:0'),
  instructions: `
You are a senior research analyst with access to a persistent code interpreter sandbox and web browser.

Your research process:
1. **Understand**: Break the question into sub-questions and identify what data/analysis is needed
2. **Plan**: Outline your approach step-by-step before executing
3. **Execute**: Use your tools strategically:
   - executeCode: For calculations, data analysis, simulations, visualizations
   - fileOperations: For saving intermediate results, reading data files, organizing outputs
   - executeCommand: For installing packages, system operations, running scripts
   - navigate: To visit websites and load web pages
   - screenshot: To capture visual information from web pages
   - getText: To extract text content from web pages
   - getHtml: To get page HTML for parsing
   - click: To interact with buttons and links
   - type: To fill forms and search boxes
   - evaluate: To run JavaScript on pages
4. **Synthesize**: Summarize findings clearly with numbered sections and a TL;DR

Best practices:
- Write modular, reusable code across multiple tool calls
- Save important intermediate results to files for later reference
- Install necessary packages (pip, npm) as needed
- Validate your calculations and cite your methods
- When browsing, take screenshots to capture visual information
- Extract and analyze web data systematically
- If you cannot execute code, fall back to reasoning but state this explicitly
- For complex analyses, break work into logical steps and explain each step

Output format:
- Use clear section headings (## Heading)
- Number key findings
- Include a TL;DR summary at the end
- Show your code and reasoning process
- Present data in tables or lists when appropriate

Remember: You have persistent environments across the conversation.
- Sandbox: Files and installed packages persist between tool calls
- Browser: Browser session persists, navigation state is maintained
`,
  tools: {
    ...codeInterpreter.tools,
    ...browser.tools,
  },
})

/**
 * Clean up function to stop the sessions when the server shuts down
 */
export async function cleanupDeepResearchAgent() {
  await Promise.all([codeInterpreter.stopSession(), browser.stopSession()])
}

// Optional: Register cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', cleanupDeepResearchAgent)
  process.on('SIGINT', cleanupDeepResearchAgent)
}
