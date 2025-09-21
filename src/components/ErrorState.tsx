/** @file Error presentation component normalising API failures. */

import type { ReactNode } from 'react'
import { ApiError, isApiError } from '../api/http'

/**
 * Props for the {@link ErrorState} component.
 */
export interface ErrorStateProps {
  /** Optional header describing the failing section. */
  title?: string
  /** Error object produced by React Query or other handlers. */
  error: unknown
  /** Optional action rendered as a button to retry the request. */
  action?: ReactNode
}

const containerStyle: React.CSSProperties = {
  background: 'rgba(127, 29, 29, 0.2)',
  border: '1px solid rgba(248, 113, 113, 0.35)',
  borderRadius: '1rem',
  color: '#fecaca',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'rgba(254, 226, 226, 0.85)',
}

/**
 * Normalises unknown error types into a human readable representation.
 *
 * @param error - Error thrown by fetch/query logic.
 * @returns Tuple of title and details strings.
 */
const describeError = (error: unknown): { message: string; detail?: string } => {
  if (isApiError(error)) {
    const apiError = error as ApiError
    const detail = apiError.status
      ? `${apiError.status} ${apiError.statusText ?? ''} – ${apiError.url}`.trim()
      : apiError.url
    return {
      message: apiError.message,
      detail,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return { message: 'An unexpected error occurred.' }
}

/**
 * Displays a standardised error panel with troubleshooting context.
 *
 * @param props - Error object and optional action/footer.
 * @returns A styled error card.
 */
export const ErrorState = ({ title = 'Something went wrong', error, action }: ErrorStateProps) => {
  const { message, detail } = describeError(error)
  return (
    <section style={containerStyle} role="alert" aria-live="assertive">
      <strong style={{ fontSize: '1rem' }}>{title}</strong>
      <span>{message}</span>
      {detail ? <span style={labelStyle}>{detail}</span> : null}
      {action ? <div>{action}</div> : null}
    </section>
  )
}
