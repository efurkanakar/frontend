/**
 * Line chart illustrating discoveries per year using Recharts primitives.
 */
import { memo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PlanetTimelinePoint } from '../api/types'

/**
 * Props for the {@link TimelineChart} component.
 */
export interface TimelineChartProps {
  /** Dataset consisting of discovery counts per year. */
  data: PlanetTimelinePoint[]
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: 320,
  background: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  padding: '1rem',
}

/**
 * Discovery timeline visualisation using Recharts.
 *
 * @param props - Timeline dataset to render.
 * @returns A responsive line chart component.
 */
export const TimelineChart = memo(({ data }: TimelineChartProps) => (
  <div style={containerStyle} role="img" aria-label="Exoplanet discovery timeline">
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
        <XAxis
          dataKey="year"
          stroke="rgba(226, 232, 240, 0.6)"
          tickLine={false}
          axisLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
        />
        <YAxis
          stroke="rgba(226, 232, 240, 0.6)"
          tickLine={false}
          axisLine={{ stroke: 'rgba(148, 163, 184, 0.35)' }}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value: unknown) => [`${value}`, 'Discoveries']}
          labelFormatter={(label) => `Year ${label}`}
          contentStyle={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.4)',
            borderRadius: '0.75rem',
            color: '#f8fafc',
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#38bdf8"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
))

TimelineChart.displayName = 'TimelineChart'
