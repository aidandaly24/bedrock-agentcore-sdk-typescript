/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress } from '@mui/material'
import { TouchApp as ClickIcon, CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'

interface ClickInput {
  selector: string
  button?: 'left' | 'right' | 'middle'
  clickCount?: number
  delay?: number
}

interface ClickOutput {
  success: boolean
  error?: string
}

interface Props {
  toolCallId: string
  input?: ClickInput
  output?: ClickOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserClickTool({ toolCallId, input, output, state }: Props) {
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
            <ClickIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Click Interaction
                </Typography>
                {input?.clickCount && input.clickCount > 1 && (
                  <Chip
                    label={`×${input.clickCount}`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'grey.100', border: 1, borderColor: 'grey.300' }}
                  />
                )}
              </Box>
              {input && (
                <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.75rem">
                  {input.selector}
                </Typography>
              )}
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

        {state === 'partial-call' && (
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Clicking...
            </Typography>
          </Box>
        )}

        {hasError && output?.error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1.5, border: 1, borderColor: 'error.main' }}>
            <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem" color="error.dark">
              {output.error}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
