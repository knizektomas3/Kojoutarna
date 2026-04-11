'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Income } from '@/types'
import Pagination from '@/components/Pagination'

function fmt(n: number) {
  return n.toLocaleString('cs-CZ') + ' Kč'
}

export default function IncomeTable({
  incomes,
  page,
  total,
  pageSize,
}: {
  incomes: Income[]
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
    await supabase.from('incomes').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  const pageTotal = incomes.reduce((s, i) => s + i.amount, 0)

  if (incomes.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-gray-400 text-sm text-center py-4">Žádné záznamy</p>
    </div>
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Datum</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Generace</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Zákazník</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Typ</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Částka</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((i) => (
              <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(i.date).toLocaleDateString('cs-CZ')}</td>
                <td className="px-4 py-3 text-gray-600">{(i.generation as any)?.name ?? '—'}</td>
                <td className="px-4 py-3">{i.customer_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{i.customer_type}</span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-600">{fmt(i.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(i.id)} disabled={deleting === i.id}
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
