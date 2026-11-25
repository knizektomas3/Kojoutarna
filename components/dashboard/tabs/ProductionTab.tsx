'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const GEN_COLORS = ['#c97318', '#3272c0', '#1f9268', '#7c5bbf']

type ProductionStat = { name: string; week: number; month: number; year: number; total: number; henCount: number | null; missingDays: number; lastProdDate: string | null; daysIntoWeek: number; monthTrend: number | null; predict7: number; predict30: number }

type Props = {
  genNames: string[]
  productionStats: ProductionStat[]
  monthlyProduction: Record<string, string | number>[]
}

function ChartTooltip({ active, payload, label, format }: { active?: boolean; payload?: readonly any[]; label?: string; format: (v: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      fontSize: 12,
      minWidth: 148,
    }}>
      {label && (
        <p style={{ color: 'var(--text-subtle)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 5 : 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: entry.fill ?? entry.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', flex: 1 }}>{entry.name}</span>
          <span style={{ color: 'var(--text)', fontWeight: 700 }}>{format(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  )
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
          className="rounded-xl px-4 py-3 flex flex-col gap-1.5"
          style={{ backgroundColor: 'rgba(234,179,8,0.09)', border: '1.5px solid rgba(234,179,8,0.3)' }}
        >
          <p className="text-xs font-bold tracking-wide uppercase" style={{ color: '#a16207', letterSpacing: '0.05em' }}>Chybějící záznamy snášky</p>
          {warnings.map(g => (
            <p key={g.name} className="text-sm" style={{ color: '#92400e' }}>
              <span className="font-semibold">{g.name}</span> – nezadáno {g.missingDays === 1 ? '1 den' : `${g.missingDays} dny/dní`}
              {g.lastProdDate && <span style={{ opacity: 0.65 }}> · poslední záznam: {g.lastProdDate}</span>}
            </p>
          ))}
        </div>
      )}

      {/* Statistiky snášky */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Statistiky snášky</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Generace</th>
                <th className="text-right">Tento týden</th>
                <th className="text-right">Tento měsíc</th>
                <th className="text-right" title="Změna oproti minulému měsíci">Trend</th>
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
                      <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2.5 flex-shrink-0" style={{ background: GEN_COLORS[i] }} />
                      <span className="font-semibold">{g.name}</span>
                    </td>
                    <td className="text-right tabular-nums">{g.week.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums">{g.month.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums">
                      {g.monthTrend !== null ? (
                        <span className="font-semibold" style={{ color: g.monthTrend >= 0 ? '#16a34a' : '#ef4444' }}>
                          {g.monthTrend >= 0 ? '▲' : '▼'} {Math.abs(g.monthTrend).toFixed(0)} %
                        </span>
                      ) : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                    </td>
                    <td className="text-right tabular-nums">{g.year.toLocaleString('cs-CZ')}</td>
                    <td className="text-right tabular-nums font-bold">{g.total.toLocaleString('cs-CZ')}</td>
                    {showPct && (
                      <td className="text-right tabular-nums">
                        {pct !== null ? (
                          <span
                            className="font-semibold"
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
                <tr style={{ borderTop: '2px solid var(--border-strong)', backgroundColor: 'var(--surface-alt)', fontWeight: 800 }}>
                  <td style={{ color: 'var(--text)' }}>Celkem</td>
                  <td className="text-right tabular-nums">{statTotals.week.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.month.toLocaleString('cs-CZ')}</td>
                  <td />
                  <td className="text-right tabular-nums">{statTotals.year.toLocaleString('cs-CZ')}</td>
                  <td className="text-right tabular-nums">{statTotals.total.toLocaleString('cs-CZ')}</td>
                  {showPct && <td />}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predikce snášky */}
      {productionStats.some(g => g.predict7 > 0) && (
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Predikce snášky</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>vychází z průměru posledních 30 dní</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {productionStats.filter(g => g.predict7 > 0).map((g, i) => (
              <div key={g.name} className="card p-3 sm:p-4 min-w-0" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: GEN_COLORS[i % GEN_COLORS.length] }} />
                  <span className="text-xs font-bold truncate" style={{ color: 'var(--text-muted)' }}>{g.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>příštích 7 dní</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>≈ {g.predict7} ks</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>příštích 30 dní</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>≈ {g.predict30} ks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graf snášky po měsících */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-sm tracking-tight mb-5" style={{ color: 'var(--text)' }}>Snáška po měsících</h2>
        {monthlyProduction.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProduction} margin={{ top: 4, right: 8, left: 0, bottom: 14 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="0" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, angle: -40, textAnchor: 'end', dy: 4 }}
                  height={52}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={String(label ?? '')} format={(v) => `${Number(v).toLocaleString('cs-CZ')} ks`} />}
                  cursor={{ fill: 'var(--surface-alt)', radius: 6 }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                {genNames.map((g, i) => (
                  <Bar
                    key={g}
                    dataKey={g}
                    stackId="a"
                    fill={GEN_COLORS[i]}
                    radius={i === genNames.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                    activeBar={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
