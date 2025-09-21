import { memo } from 'react'
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/**
 * Basic props accepted by the {@link BarChart} component.
 */
export interface BarChartProps {
  /** Data points where `name` is the label and `value` is the numeric magnitude. */
  data: Array<{ name: string; value: number }>
  /** Title used for accessibility labelling. */
  title: string
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
 * Horizontal bar chart for comparing categorical totals.
 *
 * @param props - Dataset and accessible title for the chart.
 * @returns A responsive bar chart.
 */
export const BarChart = memo(({ data, title }: BarChartProps) => (
  <div style={containerStyle} role="img" aria-label={title}>
    <ResponsiveContainer>
      <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
        <XAxis type="number" stroke="rgba(226, 232, 240, 0.6)" />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          stroke="rgba(226, 232, 240, 0.6)"
          tickLine={false}
        />
        <Tooltip
          formatter={(value: unknown) => [`${value}`, 'Planets']}
          contentStyle={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.4)',
            borderRadius: '0.75rem',
            color: '#f8fafc',
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 8, 8]} fill="#f97316" />
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
))

BarChart.displayName = 'BarChart'
