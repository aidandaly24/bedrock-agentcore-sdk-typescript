/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress } from '@mui/material'
import { Keyboard as KeyboardIcon, CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'

interface TypeInput {
  selector: string
  text: string
  delay?: number
}

interface TypeOutput {
  success: boolean
  error?: string
}

interface Props {
  toolCallId: string
  input?: TypeInput
  output?: TypeOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserTypeTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (state === 'result' && output?.success && input?.text) {
      let currentIndex = 0
      const text = input.text
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 30)
      return () => clearInterval(interval)
    }
  }, [state, output, input?.text])

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
            <KeyboardIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Text Input
              </Typography>
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

        <Box mb={2}>
          <Typography
            variant="caption"
            color="text.secondary"
            textTransform="uppercase"
            fontSize="0.75rem"
            fontWeight={600}
            letterSpacing={0.5}
          >
            Input
          </Typography>
          <Box
            sx={{
              mt: 1,
              p: 2,
              bgcolor: hasError ? 'error.light' : 'grey.50',
              borderRadius: 1.5,
              border: 1,
              borderColor: hasError ? 'error.main' : 'grey.200',
            }}
          >
            <Typography
              variant="body2"
              fontFamily="monospace"
              fontSize="0.875rem"
              color={hasError ? 'error.dark' : 'inherit'}
            >
              {isComplete
                ? output?.success
                  ? displayedText
                  : input?.text || ''
                : `▋ ${input?.text ? `${input.text.slice(0, 20)}${input.text.length > 20 ? '...' : ''}` : ''}`}
            </Typography>
          </Box>
        </Box>

        {state === 'partial-call' && (
          <Box display="flex" alignItems="center" justifyContent="center" py={3}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Typing...
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
