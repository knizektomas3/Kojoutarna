'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation, Income } from '@/types'
import { useToast } from '@/components/Toast'

const CUSTOMER_TYPES = ['Rodina', 'Známí', 'Facebook', 'Jiné']
type Customer = { id: string; name: string }

export default function IncomeEditModal({
  income,
  generations,
  customers,
  onClose,
}: {
  income: Income
  generations: Generation[]
  customers: Customer[]
  onClose: () => void
}) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(income.date)
  const [generationId, setGenerationId] = useState(income.generation_id)
  const [amount, setAmount] = useState(String(income.amount))
  const [customerId, setCustomerId] = useState(
    customers.find((c) => c.name === income.customer_name)?.id ?? ''
  )
  const [customerType, setCustomerType] = useState(income.customer_type ?? 'Známí')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const customer = customers.find((c) => c.id === customerId)
    const { error: err } = await supabase
      .from('incomes')
      .update({
        generation_id: generationId,
        date,
        amount: parseInt(amount),
        customer_name: customer?.name ?? income.customer_name,
        customer_type: customerType,
      })
      .eq('id', income.id)

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
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Upravit příjem</h2>
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
            <label className="field-label">Zákazník</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className="field-input">
              <option value="">— vyberte —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Typ zákazníka</label>
            <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className="field-input">
              {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Částka (Kč)</label>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required className="field-input" />
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
