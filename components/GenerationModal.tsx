'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GenerationModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0])
  const [henCount, setHenCount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('generations').insert({
      user_id: user!.id,
      name,
      started_at: startedAt,
      hen_count: henCount ? parseInt(henCount) : null,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="card w-full max-w-sm p-6" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--text)' }}>Nová generace</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Název</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="např. Třetí"
              className="field-input"
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Datum zahájení</label>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Počet slepic</label>
            <input
              type="number"
              min="1"
              value={henCount}
              onChange={(e) => setHenCount(e.target.value)}
              placeholder="volitelné"
              className="field-input"
            />
          </div>
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Zrušit
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Ukládám…' : 'Vytvořit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
