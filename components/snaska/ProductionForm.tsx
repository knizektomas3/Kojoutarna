'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'
import GenerationModal from '@/components/GenerationModal'
import { useToast } from '@/components/Toast'

export default function ProductionForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [generationId, setGenerationId] = useState(generations[0]?.id ?? '')
  const [eggCount, setEggCount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showGenModal, setShowGenModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generationId) { setError('Vyberte generaci'); return }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('productions').upsert({
      generation_id: generationId,
      date,
      egg_count: parseInt(eggCount),
      user_id: (await supabase.auth.getUser()).data.user!.id,
    }, { onConflict: 'user_id,generation_id,date' })

    setSaving(false)
    if (err) { setError(err.message); return }
    setEggCount('')
    toast('Záznam byl uložen')
    router.refresh()
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Přidat záznam</h2>
        <button
          type="button"
          onClick={() => setShowGenModal(true)}
          className="text-xs font-medium transition-colors"
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
              <button type="button" onClick={() => setDate(today)} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Dnes</button>
            )}
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field-input" />
        </div>
        <div>
          <label className="field-label">Generace</label>
          <select value={generationId} onChange={(e) => setGenerationId(e.target.value)} required className="field-input">
            <option value="">— vyberte —</option>
            {generations.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Počet vajec</label>
          <input
            type="number"
            min="0"
            value={eggCount}
            onChange={(e) => setEggCount(e.target.value)}
            required
            placeholder="např. 22"
            className="field-input"
          />
        </div>
        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Ukládám…' : 'Uložit záznam'}
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
