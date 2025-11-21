/* eslint-disable */
'use client'

/**
 * Browser Navigate Tool Component
 *
 * Displays browser navigation actions with Material Design
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Alert } from '@mui/material'
import { Language as LanguageIcon, CheckCircle as CheckIcon, Error as ErrorIcon } from '@mui/icons-material'

interface NavigateInput {
  url: string
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
}

interface NavigateOutput {
  success: boolean
  url: string
  title?: string
  error?: string
}

interface Props {
  toolCallId: string
  input?: NavigateInput
  output?: NavigateOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserNavigateTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
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
        '&:hover': {
          boxShadow: 1,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Box display="flex" gap={2}>
            <LanguageIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                Page Navigation
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                Browser location change
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
                '& .MuiChip-icon': {
                  color: hasError ? 'error.dark' : 'success.dark',
                },
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
              Destination
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
              <Typography variant="body2" fontFamily="monospace" fontSize="0.875rem" sx={{ wordBreak: 'break-all' }}>
                {input.url}
              </Typography>
            </Box>
          </Box>
        )}

        {input?.waitUntil && (
          <Box mb={2}>
            <Chip
              label={input.waitUntil}
              size="small"
              sx={{
                bgcolor: 'grey.100',
                border: 1,
                borderColor: 'grey.300',
                fontSize: '0.75rem',
              }}
            />
          </Box>
        )}

        {isComplete && output && (
          <Box>
            {output.success && output.title && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'success.light',
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'success.main',
                }}
              >
                <Typography
                  variant="caption"
                  color="success.dark"
                  textTransform="uppercase"
                  fontWeight={600}
                  fontSize="0.75rem"
                >
                  Page Title
                </Typography>
                <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>
                  {output.title}
                </Typography>
              </Box>
            )}
            {hasError && output.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'error.light',
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'error.main',
                }}
              >
                <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem" color="error.dark">
                  {output.error}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {state === 'partial-call' && (
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Navigating...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
