'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const GEN_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6']

type ProductionStat = { name: string; week: number; month: number; year: number; total: number }

type Props = {
  genNames: string[]
  productionStats: ProductionStat[]
  monthlyProduction: Record<string, string | number>[]
}

export default function ProductionTab({ genNames, productionStats, monthlyProduction }: Props) {
  const statTotals = {
    week: productionStats.reduce((s, g) => s + g.week, 0),
    month: productionStats.reduce((s, g) => s + g.month, 0),
    year: productionStats.reduce((s, g) => s + g.year, 0),
    total: productionStats.reduce((s, g) => s + g.total, 0),
  }

  return (
    <div className="space-y-5">
      {/* Statistiky snášky */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Statistiky snášky</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Generace</th>
                <th className="text-right">Tento týden</th>
                <th className="text-right">Tento měsíc</th>
                <th className="text-right">Tento rok</th>
                <th className="text-right">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {productionStats.map((g, i) => (
                <tr key={g.name}>
                  <td>
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: GEN_COLORS[i] }} />
                    <span className="font-medium">{g.name}</span>
                  </td>
                  <td className="text-right tabular-nums">{g.week.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{g.month.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{g.year.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums font-semibold">{g.total.toLocaleString('cs-CZ')}</td>
                </tr>
              ))}
              {productionStats.length > 1 && (
                <tr style={{ borderTop: '2px solid var(--border-strong)', backgroundColor: 'var(--surface-alt)', fontWeight: 700 }}>
                  <td style={{ color: 'var(--text)' }}>Celkem</td>
                  <td className="text-right tabular-nums">{statTotals.week.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.month.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.year.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.total.toLocaleString('cs-CZ')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graf snášky po měsících */}
      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Snáška po měsících</h2>
        {monthlyProduction.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProduction} margin={{ top: 4, right: 4, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, angle: -45, textAnchor: 'end', dy: 4 }} height={55} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => Number(v).toLocaleString('cs-CZ') + ' vajec'} cursor={{ fill: 'var(--surface-alt)' }} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                {genNames.map((g, i) => (
                  <Bar key={g} dataKey={g} stackId="a" fill={GEN_COLORS[i]} radius={i === genNames.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} activeBar={false} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
