'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Props = {
  data: { date: string; egg_count: number }[]
}

export default function EggChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Žádná data k zobrazení</p>
  }

  const formatted = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
    vajec: d.egg_count,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} vajec`, 'Snáška']} />
        <Bar dataKey="vajec" fill="#d97706" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
