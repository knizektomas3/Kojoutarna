'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'
import GenerationModal from '@/components/GenerationModal'

export default function ProductionForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const supabase = createClient()
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
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Přidat záznam</h2>
        <button
          type="button"
          onClick={() => setShowGenModal(true)}
          className="text-xs text-amber-700 hover:underline"
        >
          + Nová generace
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Datum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Generace</label>
          <select
            value={generationId}
            onChange={(e) => setGenerationId(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">— vyberte —</option>
            {generations.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Počet vajec</label>
          <input
            type="number"
            min="0"
            value={eggCount}
            onChange={(e) => setEggCount(e.target.value)}
            required
            placeholder="např. 22"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Ukládám…' : 'Uložit'}
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
