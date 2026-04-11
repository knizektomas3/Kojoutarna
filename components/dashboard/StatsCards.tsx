function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

export default function StatsCards({
  totalIncome,
  totalCost,
  totalEggs,
  generationCount,
}: {
  totalIncome: number
  totalCost: number
  totalEggs: number
  generationCount: number
}) {
  const profit = totalIncome - totalCost

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Celkové příjmy</p>
        <p className="text-2xl font-bold text-green-600">{fmt(totalIncome)}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Celkové náklady</p>
        <p className="text-2xl font-bold text-red-500">{fmt(totalCost)}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Zisk / ztráta</p>
        <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {fmt(profit)}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Vajec celkem (90 dní)</p>
        <p className="text-2xl font-bold text-amber-700">{totalEggs.toLocaleString('cs-CZ')}</p>
        <p className="text-xs text-gray-400">{generationCount} {generationCount === 1 ? 'generace' : generationCount < 5 ? 'generace' : 'generací'}</p>
      </div>
    </div>
  )
}
