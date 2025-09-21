/**
 * Simple shimmering placeholder for loading states across the UI.
 */
import type { CSSProperties } from 'react'

/**
 * Props for rendering a shimmering skeleton placeholder.
 */
export interface LoadingSkeletonProps {
  /** Width of the skeleton block (any CSS length). */
  width?: CSSProperties['width']
  /** Height of the skeleton block (any CSS length). */
  height?: CSSProperties['height']
  /** Optional border radius to apply. */
  borderRadius?: CSSProperties['borderRadius']
}

const baseStyle: CSSProperties = {
  background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.1), rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.1))',
  backgroundSize: '200% 100%',
  animation: 'pulse 1.6s ease-in-out infinite',
  borderRadius: '0.75rem',
}

/**
 * Displays a rounded shimmering block useful for loading placeholders.
 *
 * @param props - Dimensions and border radius overrides.
 * @returns A skeleton div mimicking forthcoming content.
 */
export const LoadingSkeleton = ({ width = '100%', height = '1rem', borderRadius }: LoadingSkeletonProps) => (
  <div style={{ ...baseStyle, width, height, borderRadius }} aria-hidden="true" />
)
