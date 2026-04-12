'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'
import { useToast } from '@/components/Toast'

export default function GenerationEditModal({
  generation,
  onClose,
}: {
  generation: Generation
  onClose: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [name, setName] = useState(generation.name)
  const [breed, setBreed] = useState(generation.breed ?? '')
  const [startedAt, setStartedAt] = useState(generation.started_at)
  const [henCount, setHenCount] = useState(generation.hen_count ? String(generation.hen_count) : '')
  const [notes, setNotes] = useState(generation.notes ?? '')
  const [ended, setEnded] = useState(!!generation.ended_at)
  const [endedAt, setEndedAt] = useState(generation.ended_at ?? new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('generations')
      .update({
        name,
        breed: breed || null,
        started_at: startedAt,
        hen_count: henCount ? parseInt(henCount) : null,
        notes: notes || null,
        ended_at: ended ? endedAt : null,
      })
      .eq('id', generation.id)

    setSaving(false)
    if (err) { setError(err.message); return }
    toast('Generace byla upravena')
    router.refresh()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm p-6 overflow-y-auto"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Upravit generaci</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Název</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="field-input" />
          </div>
          <div>
            <label className="field-label">Plemeno</label>
            <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="např. Dominant, ISA Brown" className="field-input" />
          </div>
          <div>
            <label className="field-label">Datum zahájení</label>
            <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required className="field-input" />
          </div>
          <div>
            <label className="field-label">Počet slepic</label>
            <input type="number" min="1" value={henCount} onChange={(e) => setHenCount(e.target.value)} placeholder="volitelné" className="field-input" />
          </div>
          <div>
            <label className="field-label">Poznámka</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="volitelné" className="field-input" />
          </div>

          {/* Stav generace */}
          <div className="pt-1">
            <div
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer select-none"
              style={{ backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border)' }}
              onClick={() => setEnded(!ended)}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  backgroundColor: ended ? 'var(--accent)' : 'var(--surface)',
                  border: `2px solid ${ended ? 'var(--accent)' : 'var(--border-strong)'}`,
                }}
              >
                {ended && <span style={{ color: 'var(--accent-text)', fontSize: '0.625rem', lineHeight: 1 }}>✓</span>}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Generace je ukončena</span>
            </div>
            {ended && (
              <div className="mt-2">
                <label className="field-label">Datum ukončení</label>
                <input type="date" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} className="field-input" />
              </div>
            )}
          </div>

          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Zrušit</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Ukládám…' : 'Uložit'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
