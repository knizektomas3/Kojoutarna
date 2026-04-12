'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation, Cost } from '@/types'
import { useToast } from '@/components/Toast'

const SUBCATEGORIES = {
  Pořizovací: ['Slepice', 'Kurník', 'Ohrádka', 'Příslušenství', 'Jiné'],
  Provozní: ['Krmení', 'Podestýlka', 'Veterinář', 'Jiné'],
}

export default function CostEditModal({
  cost,
  generations,
  onClose,
}: {
  cost: Cost
  generations: Generation[]
  onClose: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(cost.date)
  const [generationId, setGenerationId] = useState(cost.generation_id)
  const [category, setCategory] = useState<'Pořizovací' | 'Provozní'>(cost.cost_category)
  const [subcategory, setSubcategory] = useState(cost.cost_subcategory)
  const [amount, setAmount] = useState(String(cost.amount))
  const [notes, setNotes] = useState(cost.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryChange = (cat: 'Pořizovací' | 'Provozní') => {
    setCategory(cat)
    setSubcategory(SUBCATEGORIES[cat][0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('costs')
      .update({
        generation_id: generationId,
        date,
        cost_category: category,
        cost_subcategory: subcategory,
        amount: parseInt(amount),
        notes: notes || null,
      })
      .eq('id', cost.id)

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
        className="card w-full max-w-sm p-6 overflow-y-auto"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Upravit náklad</h2>
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
            <label className="field-label">Typ nákladu</label>
            <div className="flex gap-2">
              {(['Provozní', 'Pořizovací'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={
                    category === cat
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)' }
                      : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Kategorie</label>
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="field-input">
              {SUBCATEGORIES[category].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Částka (Kč)</label>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required className="field-input" />
          </div>
          <div>
            <label className="field-label">Poznámka</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="volitelné" className="field-input" />
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
