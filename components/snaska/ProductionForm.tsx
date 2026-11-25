'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductionsBulk } from '@/app/actions/records'
import type { Generation } from '@/types'
import GenerationModal from '@/components/GenerationModal'
import { useToast } from '@/components/Toast'
import { localDateStr } from '@/lib/date'

const GEN_COLORS = ['#c97318', '#3272c0', '#1f9268', '#7c5bbf']

export default function ProductionForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const today = localDateStr()

  const activeGenerations = generations.filter(g => !g.ended_at)
  const [date, setDate] = useState(today)
  const [counts, setCounts] = useState<Record<string, string>>(
    () => Object.fromEntries(activeGenerations.map(g => [g.id, '']))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showGenModal, setShowGenModal] = useState(false)

  const filledCount = Object.values(counts).filter(v => v !== '' && Number(v) > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const entries = activeGenerations
      .filter(g => counts[g.id] !== '' && !isNaN(Number(counts[g.id])) && Number(counts[g.id]) > 0)
      .map(g => ({ generation_id: g.id, date, egg_count: Math.round(Number(counts[g.id])) }))
    if (!entries.length) { setError('Zadejte alespoň jeden počet vajec'); return }
    setSaving(true)
    setError('')
    try {
      const { error: err } = await createProductionsBulk(entries)
      setSaving(false)
      if (err) { setError(err); return }
      setCounts(Object.fromEntries(activeGenerations.map(g => [g.id, ''])))
      toast('Záznamy byly uloženy')
    } catch (err) {
      setSaving(false)
      setError('Chyba serveru: ' + String(err))
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Přidat snášku</h2>
        <button
          type="button"
          onClick={() => setShowGenModal(true)}
          className="text-xs font-semibold transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          + Nová generace
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label" style={{ marginBottom: 0 }}>Datum</label>
            {date !== today && (
              <button type="button" onClick={() => setDate(today)} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                Dnes
              </button>
            )}
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="field-input" />
        </div>

        {activeGenerations.length === 0 ? (
          <p className="text-sm text-center py-3" style={{ color: 'var(--text-subtle)' }}>Žádné aktivní generace</p>
        ) : (
          <div className="space-y-2.5">
            <label className="field-label">Počet vajec</label>
            {activeGenerations.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 w-2 h-2 rounded-sm"
                  style={{ background: GEN_COLORS[i % GEN_COLORS.length] }}
                />
                <span className="text-sm font-semibold flex-1 min-w-0 truncate" style={{ color: 'var(--text-muted)' }}>
                  {g.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={counts[g.id] ?? ''}
                    onChange={e => setCounts(prev => ({ ...prev, [g.id]: e.target.value }))}
                    placeholder="0"
                    className="field-input text-right"
                    style={{ width: 80 }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-subtle)' }}>ks</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        <button type="submit" disabled={saving || activeGenerations.length === 0} className="btn-primary">
          {saving ? 'Ukládám…' : filledCount > 0 ? `Uložit záznamy (${filledCount})` : 'Uložit záznamy'}
        </button>
      </form>

      {showGenModal && (
        <GenerationModal
          onClose={() => setShowGenModal(false)}
          onSaved={() => { setShowGenModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
