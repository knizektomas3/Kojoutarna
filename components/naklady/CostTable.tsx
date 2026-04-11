'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Cost } from '@/types'
import Pagination from '@/components/Pagination'

function fmt(n: number) {
  return n.toLocaleString('cs-CZ') + ' Kč'
}

export default function CostTable({
  costs,
  page,
  total,
  pageSize,
}: {
  costs: Cost[]
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Smazat tento záznam?')) return
    setDeleting(id)
    await supabase.from('costs').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  const pageSum = costs.reduce((s, c) => s + c.amount, 0)
  const acquisition = costs.filter((c) => c.cost_category === 'Pořizovací').reduce((s, c) => s + c.amount, 0)
  const operational = costs.filter((c) => c.cost_category === 'Provozní').reduce((s, c) => s + c.amount, 0)

  if (costs.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-gray-400 text-sm text-center py-4">Žádné záznamy</p>
    </div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
        <span className="text-sm text-gray-500">Celkem {total} záznamů</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Datum</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Generace</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Typ</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kategorie</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Částka</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(c.date).toLocaleDateString('cs-CZ')}</td>
                <td className="px-4 py-3 text-gray-600">{(c.generation as any)?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.cost_category === 'Pořizovací' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>{c.cost_category}</span>
                </td>
                <td className="px-4 py-3">{c.cost_subcategory}</td>
                <td className="px-4 py-3 text-right font-medium text-red-500">{fmt(c.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                    className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-3">
        <Pagination page={page} total={total} pageSize={pageSize} />
      </div>
    </div>
  )
}
