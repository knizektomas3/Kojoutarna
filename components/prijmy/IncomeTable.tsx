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

  if (incomes.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-subtle)' }}>Žádné záznamy</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Generace</th>
              <th>Zákazník</th>
              <th>Typ</th>
              <th className="text-right">Částka</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((i) => (
              <tr key={i.id}>
                <td>{new Date(i.date).toLocaleDateString('cs-CZ')}</td>
                <td style={{ color: 'var(--text-muted)' }}>{(i.generation as any)?.name ?? '—'}</td>
                <td>{i.customer_name ?? '—'}</td>
                <td>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}>
                    {i.customer_type}
                  </span>
                </td>
                <td className="text-right font-semibold tabular-nums" style={{ color: '#16a34a' }}>{fmt(i.amount)}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleDelete(i.id)}
                    disabled={deleting === i.id}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--border-strong)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-strong)' }}
                  >
                    ✕
                  </button>
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
