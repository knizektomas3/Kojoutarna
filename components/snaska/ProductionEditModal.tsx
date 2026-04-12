'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation, Production } from '@/types'
import { useToast } from '@/components/Toast'

export default function ProductionEditModal({
  production,
  generations,
  onClose,
}: {
  production: Production
  generations: Generation[]
  onClose: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [date, setDate] = useState(production.date)
  const [generationId, setGenerationId] = useState(production.generation_id)
  const [eggCount, setEggCount] = useState(String(production.egg_count))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('productions')
      .update({ generation_id: generationId, date, egg_count: parseInt(eggCount) })
      .eq('id', production.id)

    setSaving(false)
    if (err) { setError(err.message); return }
    toast('Záznam byl upraven')
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
        className="card w-full max-w-sm p-6"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Upravit záznam snášky</h2>
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
              {generations.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Počet vajec</label>
            <input type="number" min="0" value={eggCount} onChange={(e) => setEggCount(e.target.value)} required className="field-input" />
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
