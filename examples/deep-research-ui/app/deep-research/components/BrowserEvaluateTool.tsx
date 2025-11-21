/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Divider } from '@mui/material'
import { Code as CodeIcon, CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'

interface EvaluateInput {
  expression: string
}

interface EvaluateOutput {
  success: boolean
  result?: string
  error?: string
}

interface Props {
  toolCallId: string
  input?: EvaluateInput
  output?: EvaluateOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserEvaluateTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const isComplete = state === 'result' || state === 'error'
  const hasError = state === 'error' || output?.error

  return (
    <Card
      sx={{
        my: 2,
        opacity: isAnimated ? 1 : 0,
        transform: isAnimated ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.3s ease-in-out',
        border: 1,
        borderColor: 'divider',
        boxShadow: 'none',
        '&:hover': { boxShadow: 1 },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" gap={2}>
            <CodeIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                JavaScript Evaluation
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                Execute code in browser context
              </Typography>
            </Box>
          </Box>
          {isComplete && (
            <Chip
              icon={hasError ? <ErrorIcon sx={{ fontSize: 14 }} /> : <CheckIcon sx={{ fontSize: 14 }} />}
              label={hasError ? 'Failed' : 'Complete'}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                bgcolor: hasError ? 'error.light' : 'success.light',
                color: hasError ? 'error.dark' : 'success.dark',
                border: 1,
                borderColor: hasError ? 'error.main' : 'success.main',
              }}
            />
          )}
        </Box>

        {input && (
          <Box mb={2}>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              fontSize="0.75rem"
              fontWeight={600}
              letterSpacing={0.5}
            >
              Expression
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1.5,
                border: 1,
                borderColor: 'grey.200',
              }}
            >
              <Typography
                component="pre"
                variant="body2"
                fontFamily="monospace"
                fontSize="0.75rem"
                sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {input.expression}
              </Typography>
            </Box>
          </Box>
        )}

        {isComplete && output && (
          <>
            {output.result && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontSize="0.75rem"
                  fontWeight={600}
                  letterSpacing={0.5}
                >
                  Result
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: 'success.main',
                  }}
                >
                  <Typography
                    component="pre"
                    variant="body2"
                    fontFamily="monospace"
                    fontSize="0.75rem"
                    color="success.dark"
                    sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                  >
                    {output.result}
                  </Typography>
                </Box>
              </Box>
            )}
            {hasError && output.error && (
              <Box
                sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1.5, border: 1, borderColor: 'error.main' }}
              >
                <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem" color="error.dark">
                  {output.error}
                </Typography>
              </Box>
            )}
          </>
        )}

        {state === 'partial-call' && (
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Evaluating...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
