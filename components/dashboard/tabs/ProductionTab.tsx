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
    <div className="space-y-6">
      {/* Statistiky snášky */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">Statistiky snášky</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Generace</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tento týden</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tento měsíc</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Tento rok</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {productionStats.map((g, i) => (
                <tr key={g.name} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: GEN_COLORS[i] }} />
                    {g.name}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{g.week.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{g.month.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{g.year.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{g.total.toLocaleString('cs-CZ')}</td>
                </tr>
              ))}
              {productionStats.length > 1 && (
                <tr className="font-bold text-gray-700 border-t-2 bg-gray-50">
                  <td className="px-4 py-3">Celkem</td>
                  <td className="px-4 py-3 text-right tabular-nums">{statTotals.week.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{statTotals.month.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{statTotals.year.toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{statTotals.total.toLocaleString('cs-CZ')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Graf snášky po měsících */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-700 mb-4">Snáška po měsících</h2>
        {monthlyProduction.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyProduction} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, angle: -45, textAnchor: 'end', dy: 4 }} height={50} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => Number(v).toLocaleString('cs-CZ') + ' vajec'} />
              <Legend />
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
