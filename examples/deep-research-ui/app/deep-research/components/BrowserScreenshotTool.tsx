/* eslint-disable */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress, Dialog, IconButton } from '@mui/material'
import {
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material'

interface ScreenshotInput {
  selector?: string
  fullPage?: boolean
}

interface ScreenshotOutput {
  success: boolean
  screenshot?: string
  format?: string
  width?: number
  height?: number
  error?: string
}

interface Props {
  toolCallId: string
  input?: ScreenshotInput
  output?: ScreenshotOutput
  state: 'partial-call' | 'result' | 'error'
}

export function BrowserScreenshotTool({ toolCallId, input, output, state }: Props) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const isComplete = state === 'result' || state === 'error'
  const hasError = state === 'error' || output?.error
  const hasScreenshot = output?.screenshot

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
            <CameraIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Visual Capture
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                Page screenshot
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

        {(input?.fullPage || input?.selector) && (
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            {input?.fullPage && (
              <Chip
                label="Full Page"
                size="small"
                sx={{ bgcolor: 'grey.100', border: 1, borderColor: 'grey.300', fontSize: '0.75rem' }}
              />
            )}
            {input?.selector && (
              <Chip
                label={input.selector}
                size="small"
                sx={{ bgcolor: 'grey.100', border: 1, borderColor: 'grey.300', fontSize: '0.75rem' }}
              />
            )}
          </Box>
        )}

        {hasScreenshot && (
          <>
            <Box
              onClick={() => setIsModalOpen(true)}
              sx={{
                position: 'relative',
                opacity: imageLoaded ? 1 : 0,
                transform: imageLoaded ? 'translateY(0)' : 'translateY(8px)',
                transition: 'all 0.5s ease-in-out',
                borderRadius: 1.5,
                overflow: 'hidden',
                border: 1,
                borderColor: 'grey.200',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                  '& .zoom-icon': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box
                component="img"
                src={`data:image/png;base64,${output.screenshot}`}
                alt="Browser screenshot"
                sx={{ width: '100%', display: 'block' }}
                onLoad={() => setImageLoaded(true)}
              />
              <Box
                className="zoom-icon"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 0.5,
                  backdropFilter: 'blur(8px)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <ZoomInIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
              {output.width && output.height && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Typography variant="caption" fontFamily="monospace" fontSize="0.7rem" color="text.secondary">
                    {output.width} × {output.height}px
                  </Typography>
                </Box>
              )}
            </Box>

            <Dialog
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              maxWidth="xl"
              fullWidth
              PaperProps={{
                sx: {
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  maxHeight: '90vh',
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <IconButton
                  onClick={() => setIsModalOpen(false)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    zIndex: 1,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  component="img"
                  src={`data:image/png;base64,${output.screenshot}`}
                  alt="Browser screenshot (full size)"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '85vh',
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                />
              </Box>
            </Dialog>
          </>
        )}

        {hasError && output?.error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1.5, border: 1, borderColor: 'error.main' }}>
            <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem" color="error.dark">
              {output.error}
            </Typography>
          </Box>
        )}

        {state === 'partial-call' && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
            <CircularProgress size={20} sx={{ mb: 1.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
              Capturing screenshot...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
