'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'

const CUSTOMER_TYPES = ['Rodina', 'Známí', 'Facebook', 'Jiné']

type Customer = { id: string; name: string }

export default function IncomeForm({
  generations,
  customers: initialCustomers,
}: {
  generations: Generation[]
  customers: Customer[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [generationId, setGenerationId] = useState(generations[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customerType, setCustomerType] = useState('Známí')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [customerError, setCustomerError] = useState('')

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return
    setAddingCustomer(true)
    setCustomerError('')

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCustomerName.trim() }),
    })
    const data = await res.json()
    setAddingCustomer(false)

    if (!res.ok) { setCustomerError(data.error); return }

    const updated = [...customers, data].sort((a, b) => a.name.localeCompare(b.name, 'cs'))
    setCustomers(updated)
    setCustomerId(data.id)
    setNewCustomerName('')
    setShowNewCustomer(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!generationId) { setError('Vyberte generaci'); return }
    if (!customerId) { setError('Vyberte zákazníka'); return }
    setSaving(true)
    setError('')

    const customer = customers.find((c) => c.id === customerId)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('incomes').insert({
      user_id: user!.id,
      generation_id: generationId,
      date,
      income_type: 'Prodej',
      amount: parseInt(amount),
      customer_name: customer?.name ?? null,
      customer_type: customerType,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setAmount('')
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-600">Zákazník</label>
            <button
              type="button"
              onClick={() => { setShowNewCustomer(!showNewCustomer); setCustomerError('') }}
              className="text-xs text-amber-700 hover:underline"
            >
              {showNewCustomer ? 'Zrušit' : '+ Nový zákazník'}
            </button>
          </div>

          {showNewCustomer ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Jméno zákazníka"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomer())}
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomer}
                disabled={addingCustomer || !newCustomerName.trim()}
                className="bg-amber-700 hover:bg-amber-600 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {addingCustomer ? '…' : 'Přidat'}
              </button>
            </div>
          ) : (
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">— vyberte —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {customerError && <p className="text-red-500 text-xs mt-1">{customerError}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Typ zákazníka</label>
          <select value={customerType} onChange={(e) => setCustomerType(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
            {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Částka (Kč)</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="např. 240"
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
