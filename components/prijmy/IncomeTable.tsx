'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation, Income } from '@/types'
import Pagination from '@/components/Pagination'
import ConfirmModal from '@/components/ConfirmModal'
import IncomeEditModal from './IncomeEditModal'
import { useToast } from '@/components/Toast'

function fmt(n: number) {
  return n.toLocaleString('cs-CZ') + ' Kč'
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

type Customer = { id: string; name: string }

export default function IncomeTable({
  incomes,
  generations,
  customers,
  page,
  total,
  pageSize,
}: {
  incomes: Income[]
  generations: Generation[]
  customers: Customer[]
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Income | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setConfirmId(null)
    await supabase.from('incomes').delete().eq('id', id)
    setDeleting(null)
    toast('Záznam byl smazán')
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
    <>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(i)}
                        className="transition-colors"
                        style={{ color: 'var(--border-strong)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--border-strong)' }}
                        title="Upravit"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setConfirmId(i.id)}
                        disabled={deleting === i.id}
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
          message="Opravdu chcete smazat tento příjem?"
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {editing && (
        <IncomeEditModal
          income={editing}
          generations={generations}
          customers={customers}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
