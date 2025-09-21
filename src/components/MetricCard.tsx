interface Props {
  title: string
  metric: number
  unit?: string
  description?: string
  loading?: boolean
}
export default function MetricCard({ title, metric, unit, description, loading }: Props) {
  return (
    <div className="card">
      <div className="muted" style={{fontSize:12}}>{title}</div>
      <div style={{fontSize:28, fontWeight:700, lineHeight:1.2}}>
        {loading ? '…' : Intl.NumberFormat().format(metric)}{unit ?? ''}
      </div>
      {description && <div className="muted" style={{fontSize:13}}>{description}</div>}
    </div>
  )
}
