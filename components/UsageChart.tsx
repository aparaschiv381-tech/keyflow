'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: { date: string; total_calls: number }[]
}

export default function UsageChart({ data }: Props) {
  const formatted = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calls: d.total_calls,
  }))

  if (formatted.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
        No usage data yet. Make your first API call to see it here.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#F9FAFB' }}
          itemStyle={{ color: '#60A5FA' }}
        />
        <Bar dataKey="calls" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
