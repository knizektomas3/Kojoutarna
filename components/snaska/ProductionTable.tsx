'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation, Production } from '@/types'
import Pagination from '@/components/Pagination'
import ConfirmModal from '@/components/ConfirmModal'
import ProductionEditModal from './ProductionEditModal'
import { useToast } from '@/components/Toast'

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

export default function ProductionTable({
  productions,
  generations,
  page,
  total,
  pageSize,
}: {
  productions: Production[]
  generations: Generation[]
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Production | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setConfirmId(null)
    await supabase.from('productions').delete().eq('id', id)
    setDeleting(null)
    toast('Záznam byl smazán')
    router.refresh()
  }

  const GEN_ROW_COLORS = [
    'rgba(217,119,6,0.07)',
    'rgba(59,130,246,0.07)',
    'rgba(16,185,129,0.07)',
    'rgba(139,92,246,0.07)',
  ]
  const genIndexMap = Object.fromEntries(generations.map((g, i) => [g.id, i]))

  if (productions.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-subtle)' }}>Žádné záznamy</p>
      </div>
    )
  }

  return (
    <>
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
                <tr key={p.id} style={{ backgroundColor: GEN_ROW_COLORS[genIndexMap[p.generation_id] ?? 0] }}>
                  <td>{new Date(p.date).toLocaleDateString('cs-CZ')}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{(p.generation as any)?.name ?? '—'}</td>
                  <td className="text-right font-medium tabular-nums">{p.egg_count}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="transition-colors"
                        style={{ color: 'var(--border-strong)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-strong)' }}
                        title="Upravit"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        disabled={deleting === p.id}
                        className="text-sm transition-colors"
                        style={{ color: 'var(--border-strong)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-strong)' }}
                        title="Smazat"
                      >
                        ✕
                      </button>
                    </div>
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

      {confirmId && (
        <ConfirmModal
          message="Opravdu chcete smazat tento záznam snášky?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {editing && (
        <ProductionEditModal
          production={editing}
          generations={generations}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
