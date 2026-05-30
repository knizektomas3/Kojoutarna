'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const GEN_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6']

type ProductionStat = { name: string; week: number; month: number; year: number; total: number; henCount: number | null; missingDays: number; daysIntoWeek: number }

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

  const warnings = productionStats.filter(g => g.missingDays > 0)
  const showPct = productionStats.some(g => g.henCount)

  return (
    <div className="space-y-5">
      {/* Varování o chybějících záznamech */}
      {warnings.length > 0 && (
        <div
          className="rounded-lg px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.35)' }}
        >
          <p className="text-xs font-semibold" style={{ color: '#a16207' }}>Chybějící záznamy snášky</p>
          {warnings.map(g => (
            <p key={g.name} className="text-xs" style={{ color: '#92400e' }}>
              {g.name} generace – nezadáno {g.missingDays === 1 ? '1 den' : `${g.missingDays} dny/dní`}
            </p>
          ))}
        </div>
      )}

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
                {showPct && <th className="text-right">Týdenní snáška %</th>}
              </tr>
            </thead>
            <tbody>
              {productionStats.map((g, i) => {
                const weeklyAvg = g.week / g.daysIntoWeek
                const pct = g.henCount && g.henCount > 0 ? (weeklyAvg / g.henCount) * 100 : null
                return (
                  <tr key={g.name}>
                    <td>
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: GEN_COLORS[i] }} />
                      <span className="font-medium">{g.name}</span>
                    </td>
                    <td className="text-right tabular-nums">{g.week.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums">{g.month.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums">{g.year.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums font-semibold">{g.total.toLocaleString('cs-CZ')}</td>
                    {showPct && (
                      <td className="text-right tabular-nums">
                        {pct !== null ? (
                          <span
                            className="font-medium"
                            style={{ color: pct >= 70 ? '#16a34a' : pct >= 50 ? '#d97706' : '#ef4444' }}
                          >
                            {pct.toFixed(0)} %
                          </span>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                )
              })}
              {productionStats.length > 1 && (
                <tr style={{ borderTop: '2px solid var(--border-strong)', backgroundColor: 'var(--surface-alt)', fontWeight: 700 }}>
                  <td style={{ color: 'var(--text)' }}>Celkem</td>
                  <td className="text-right tabular-nums">{statTotals.week.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.month.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.year.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.total.toLocaleString('cs-CZ')}</td>
                  {showPct && <td />}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graf snášky po měsících */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Snáška po měsících</h2>
        {monthlyProduction.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyProduction} margin={{ top: 4, right: 4, left: 4, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, angle: -45, textAnchor: 'end', dy: 4 }} height={55} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip formatter={(v) => Number(v).toLocaleString('cs-CZ') + ' vajec'} cursor={{ fill: 'var(--surface-alt)' }} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8, fontSize: 12 }} />
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
