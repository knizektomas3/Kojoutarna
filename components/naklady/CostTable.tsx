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

  if (costs.length === 0) {
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
              <th>Typ</th>
              <th>Kategorie</th>
              <th className="text-right">Částka</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id}>
                <td>{new Date(c.date).toLocaleDateString('cs-CZ')}</td>
                <td style={{ color: 'var(--text-muted)' }}>{(c.generation as any)?.name ?? '—'}</td>
                <td>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      c.cost_category === 'Pořizovací'
                        ? { backgroundColor: 'rgba(139,92,246,0.12)', color: '#7c3aed' }
                        : { backgroundColor: 'rgba(59,130,246,0.12)', color: '#2563eb' }
                    }>
                    {c.cost_category}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{c.cost_subcategory}</td>
                <td className="text-right font-semibold tabular-nums" style={{ color: '#ef4444' }}>{fmt(c.amount)}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
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
