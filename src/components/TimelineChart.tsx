import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { TimelinePoint } from '../types'

export default function TimelineChart({ data, loading }: { data: TimelinePoint[], loading?: boolean }) {
  if (loading) return <div>Loading chart…</div>
  if (!data?.length) return <div className="muted">No timeline data.</div>
  return (
    <div style={{width:'100%', height:320}}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
