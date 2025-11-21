/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Button } from '@mui/material'
import {
  Article as ArticleIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material'

interface GetTextInput {
  selector?: string
}

interface GetTextOutput {
  success: boolean
  text?: string
  error?: string
}

interface Props {
  toolCallId: string
  input?: GetTextInput
  output?: GetTextOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserGetTextTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const isComplete = state === 'result' || state === 'error'
  const hasError = state === 'error' || output?.error
  const hasText = output?.text
  const textLength = output?.text?.length || 0
  const isLong = textLength > 300

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
            <ArticleIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Text Extraction
              </Typography>
              {input?.selector ? (
                <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontSize="0.75rem">
                  {input.selector}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                  Visible content extraction
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

        {hasText && (
          <Box>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1.5,
                border: 1,
                borderColor: 'grey.200',
                maxHeight: isExpanded || !isLong ? 'none' : 200,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Typography variant="body2" fontSize="0.875rem" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {output.text}
              </Typography>
              {!isExpanded && isLong && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    background: 'linear-gradient(transparent, rgb(249, 250, 251))',
                  }}
                />
              )}
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
              Extracting text...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
