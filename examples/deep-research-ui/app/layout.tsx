import './globals.css'

export const metadata = {
  title: 'Deep Research Agent',
  description: 'AI-powered research agent using AWS Bedrock and Code Interpreter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
