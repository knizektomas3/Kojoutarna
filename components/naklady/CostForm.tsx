'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'

const SUBCATEGORIES = {
  Pořizovací: ['Slepice', 'Kurník', 'Ohrádka', 'Příslušenství', 'Jiné'],
  Provozní: ['Krmení', 'Podestýlka', 'Veterinář', 'Jiné'],
}

export default function CostForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const supabase = createClient()
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
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-700 mb-4">Přidat náklad</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Datum</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Generace</label>
          <select value={generationId} onChange={(e) => setGenerationId(e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">— vyberte —</option>
            {generations.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Typ nákladu</label>
          <div className="flex gap-2">
            {(['Provozní', 'Pořizovací'] as const).map((cat) => (
              <button key={cat} type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  category === cat
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Kategorie</label>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            {SUBCATEGORIES[category].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Částka (Kč)</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="např. 3500"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Poznámka</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="volitelné"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? 'Ukládám…' : 'Uložit'}
        </button>
      </form>
    </div>
  )
}
