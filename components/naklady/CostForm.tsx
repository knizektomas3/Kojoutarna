'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'
import { useToast } from '@/components/Toast'

const SUBCATEGORIES = {
  Pořizovací: ['Slepice', 'Kurník', 'Ohrádka', 'Příslušenství', 'Jiné'],
  Provozní: ['Krmení', 'Podestýlka', 'Veterinář', 'Jiné'],
}

export default function CostForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [generationId, setGenerationId] = useState(generations[0]?.id ?? '')
  const [category, setCategory] = useState<'Pořizovací' | 'Provozní'>('Provozní')
  const [subcategory, setSubcategory] = useState('Krmení')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryChange = (cat: 'Pořizovací' | 'Provozní') => {
    setCategory(cat)
    setSubcategory(SUBCATEGORIES[cat][0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generationId) { setError('Vyberte generaci'); return }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('costs').insert({
      user_id: user!.id,
      generation_id: generationId,
      date,
      cost_category: category,
      cost_subcategory: subcategory,
      amount: parseInt(amount),
      notes: notes || null,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setAmount('')
    setNotes('')
    toast('Náklad byl uložen')
    router.refresh()
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text)' }}>Přidat náklad</h2>
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
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="např. 3500" className="field-input" />
        </div>
        <div>
          <label className="field-label">Poznámka</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="volitelné" className="field-input" />
        </div>
        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Ukládám…' : 'Uložit náklad'}
        </button>
      </form>
    </div>
  )
}
