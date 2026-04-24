'use client'

import { useState } from 'react'
import { createIncome } from '@/app/actions/records'
import type { Generation } from '@/types'
import { useToast } from '@/components/Toast'

const CUSTOMER_TYPES = ['Rodina', 'Známí', 'Facebook', 'Jiné']

type Customer = { id: string; name: string }

export default function IncomeForm({
  generations,
  customers: initialCustomers,
}: {
  generations: Generation[]
  customers: Customer[]
}) {
  const { toast } = useToast()
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
    const result = await createIncome({
      generation_id: generationId,
      date,
      amount: parseInt(amount),
      customer_name: customer?.name ?? null,
      customer_type: customerType,
    })

    setSaving(false)
    if (result.error) { setError(result.error); return }
    setAmount('')
    toast('Příjem byl uložen')
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-sm mb-5" style={{ color: 'var(--text)' }}>Přidat příjem</h2>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label" style={{ marginBottom: 0 }}>Zákazník</label>
            <button
              type="button"
              onClick={() => { setShowNewCustomer(!showNewCustomer); setCustomerError('') }}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
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
                className="field-input"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomer())}
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustomer}
                disabled={addingCustomer || !newCustomerName.trim()}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 0.875rem' }}
              >
                {addingCustomer ? '…' : 'Přidat'}
              </button>
            </div>
          ) : (
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="field-input">
              <option value="">— vyberte —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {customerError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{customerError}</p>}
        </div>
        <div>
          <label className="field-label">Typ zákazníka</label>
          <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className="field-input">
            {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Částka (Kč)</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="např. 240" className="field-input" />
        </div>
        {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Ukládám…' : 'Uložit příjem'}
        </button>
      </form>
    </div>
  )
}
