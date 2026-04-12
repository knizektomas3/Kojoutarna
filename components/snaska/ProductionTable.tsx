'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Production } from '@/types'
import Pagination from '@/components/Pagination'

export default function ProductionTable({
  productions,
  page,
  total,
  pageSize,
}: {
  productions: Production[]
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
    await supabase.from('productions').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  if (productions.length === 0) {
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
              <th className="text-right">Vajec</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productions.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.date).toLocaleDateString('cs-CZ')}</td>
                <td style={{ color: 'var(--text-muted)' }}>{(p.generation as any)?.name ?? '—'}</td>
                <td className="text-right font-medium tabular-nums">{p.egg_count}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
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
