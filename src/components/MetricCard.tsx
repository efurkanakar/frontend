import type { ReactNode } from 'react'

/**
 * Compact card presenting a single KPI metric on the dashboard.
 */
export interface MetricCardProps {
  /** Title displayed above the metric value. */
  title: string
  /** Highlighted value, typically formatted text or a React element. */
  value: ReactNode
  /** Optional supporting text rendered below the value. */
  hint?: ReactNode
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  padding: '1.25rem 1.5rem',
  boxShadow: '0 25px 45px rgba(15, 23, 42, 0.45)',
}

/**
 * Renders a stylised KPI card with a headline metric value.
 *
 * @param props - Card title, value, and optional supporting hint.
 * @returns A decorated card element.
 */
export const MetricCard = ({ title, value, hint }: MetricCardProps) => (
  <article style={cardStyle} aria-label={title}>
    <span style={{ color: 'rgba(226, 232, 240, 0.75)', fontSize: '0.85rem' }}>{title}</span>
    <strong
      style={{
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: '#f8fafc',
      }}
    >
      {value}
    </strong>
    {hint ? (
      <span style={{ color: 'rgba(226, 232, 240, 0.6)', fontSize: '0.85rem' }}>{hint}</span>
    ) : null}
  </article>
)
