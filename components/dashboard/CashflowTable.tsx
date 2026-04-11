import type { Cashflow } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

export default function CashflowTable({ cashflow }: { cashflow: Cashflow[] }) {
  if (cashflow.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Žádné generace. Začněte přidáním nákladů nebo příjmů.</p>
  }

  const totals = cashflow.reduce((acc, g) => ({
    total_income: acc.total_income + g.total_income,
    acquisition_cost: acc.acquisition_cost + g.acquisition_cost,
    operational_cost: acc.operational_cost + g.operational_cost,
    total_cost: acc.total_cost + g.total_cost,
    operational_profit: acc.operational_profit + g.operational_profit,
    total_profit: acc.total_profit + g.total_profit,
  }), { total_income: 0, acquisition_cost: 0, operational_cost: 0, total_cost: 0, operational_profit: 0, total_profit: 0 })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-2">Generace</th>
            <th className="text-right py-2">Příjmy</th>
            <th className="text-right py-2">Prov. zisk</th>
            <th className="text-right py-2">Celk. zisk</th>
          </tr>
        </thead>
        <tbody>
          {cashflow.map((g) => (
            <tr key={g.generation_id} className="border-b border-gray-50">
              <td className="py-2 font-medium">{g.generation_name}</td>
              <td className="text-right py-2 text-green-600">{fmt(g.total_income)}</td>
              <td className={`text-right py-2 ${g.operational_profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmt(g.operational_profit)}
              </td>
              <td className={`text-right py-2 font-semibold ${g.total_profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmt(g.total_profit)}
              </td>
            </tr>
          ))}
          {cashflow.length > 1 && (
            <tr className="font-bold text-gray-700 border-t-2">
              <td className="py-2">Celkem</td>
              <td className="text-right py-2 text-green-600">{fmt(totals.total_income)}</td>
              <td className={`text-right py-2 ${totals.operational_profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmt(totals.operational_profit)}
              </td>
              <td className={`text-right py-2 ${totals.total_profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmt(totals.total_profit)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
