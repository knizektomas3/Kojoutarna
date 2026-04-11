'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'

const CUSTOMER_TYPES = ['Rodina', 'Známí', 'Facebook', 'Jiné']

export default function IncomeForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [generationId, setGenerationId] = useState(generations[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerType, setCustomerType] = useState('Známí')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generationId) { setError('Vyberte generaci'); return }
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('incomes').insert({
      user_id: user!.id,
      generation_id: generationId,
      date,
      income_type: 'Prodej',
      amount: parseInt(amount),
      customer_name: customerName || null,
      customer_type: customerType,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setAmount('')
    setCustomerName('')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-700 mb-4">Přidat příjem</h2>
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
          <label className="block text-sm text-gray-600 mb-1">Částka (Kč)</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="např. 240"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Zákazník</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="volitelné"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Typ zákazníka</label>
          <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
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
