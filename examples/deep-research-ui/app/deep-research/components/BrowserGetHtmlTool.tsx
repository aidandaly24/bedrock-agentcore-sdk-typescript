/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Button } from '@mui/material'
import {
  Code as CodeIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'

interface GetHtmlInput {
  selector?: string
}

interface GetHtmlOutput {
  success: boolean
  html?: string
  error?: string
}

interface Props {
  toolCallId: string
  input?: GetHtmlInput
  output?: GetHtmlOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserGetHtmlTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const isComplete = state === 'result' || state === 'error'
  const hasError = state === 'error' || output?.error
  const hasHtml = output?.html
  const htmlLength = output?.html?.length || 0
  const isLong = htmlLength > 400

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
                HTML Extraction
              </Typography>
              {input?.selector ? (
                <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.75rem">
                  {input.selector}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                  Full page HTML
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

        {hasHtml && (
          <Box>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1.5,
                border: 1,
                borderColor: 'grey.200',
                maxHeight: isExpanded || !isLong ? 'none' : 250,
                overflow: 'auto',
              }}
            >
              <Typography
                component="pre"
                variant="body2"
                fontFamily="monospace"
                fontSize="0.75rem"
                sx={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {output.html}
              </Typography>
            </Box>
            {isLong && (
              <Button
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
                endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ mt: 1, textTransform: 'none', fontSize: '0.875rem' }}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </Box>
        )}

        {hasError && output?.error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1.5, border: 1, borderColor: 'error.main' }}>
            <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem" color="error.dark">
              {output.error}
            </Typography>
          </Box>
        )}

        {state === 'partial-call' && (
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={16} sx={{ mr: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Extracting HTML...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
