'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Generation } from '@/types'
import GenerationEditModal from '@/components/GenerationEditModal'
import ConfirmModal from '@/components/ConfirmModal'
import { useToast } from '@/components/Toast'

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('cs-CZ')
}

export default function GenerationsTab({ generations, avgEggsPerDay }: { generations: Generation[]; avgEggsPerDay: Record<string, number> }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [gens, setGens] = useState<Generation[]>(generations)
  const [editing, setEditing] = useState<Generation | null>(null)
  const [endingId, setEndingId] = useState<string | null>(null)

  const handleUpdated = (updated: Generation) => {
    setGens((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
    setEditing(null)
  }

  const handleEnd = async (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('generations').update({ ended_at: today }).eq('id', id)
    setGens((prev) => prev.map((g) => (g.id === id ? { ...g, ended_at: today } : g)))
    setEndingId(null)
    toast('Generace byla ukončena')
    router.refresh()
  }

  const active = gens.filter((g) => !g.ended_at)
  const ended = gens.filter((g) => g.ended_at)

  const GenCard = ({ g }: { g: Generation }) => {
    const avg = avgEggsPerDay[g.id] ?? 0
    const isActive = !g.ended_at
    const ageMs = new Date().getTime() - new Date(g.started_at).getTime()
    const ageDays = Math.floor(ageMs / 86400000) + 17 * 7
    const ageWeeks = Math.floor(ageDays / 7)

    return (
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{g.name} generace</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(22,163,74,0.12)', color: '#16a34a' }
                    : { backgroundColor: 'var(--surface-alt)', color: 'var(--text-subtle)' }
                }
              >
                {isActive ? 'Aktivní' : 'Ukončena'}
              </span>
            </div>
            {g.breed && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{g.breed}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(g)}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'var(--surface-alt)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = '' }}
              title="Upravit"
            >
              <PencilIcon />
            </button>
            {isActive && (
              <button
                onClick={() => setEndingId(g.id)}
                className="text-xs px-2 py-1 rounded-md font-medium transition-colors"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                Ukončit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Zahájení</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{fmt(g.started_at)}</p>
          </div>
          {g.ended_at ? (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Ukončení</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{fmt(g.ended_at)}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Věk</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {ageWeeks >= 2 ? `${ageWeeks} týdnů` : `${ageDays} dní`}
              </p>
            </div>
          )}
          {g.hen_count && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Slepic</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{g.hen_count}</p>
            </div>
          )}
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Průměr vajec/den</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {avg > 0 ? `${avg.toFixed(1)} ks` : '—'}
            </p>
          </div>
          {g.notes && (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs mb-0.5" style={{ color: 'var(--text-subtle)' }}>Poznámka</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{g.notes}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {active.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Aktivní generace</h2>
          <div className="space-y-3">
            {active.map((g) => <GenCard key={g.id} g={g} />)}
          </div>
        </div>
      )}

      {ended.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Ukončené generace</h2>
          <div className="space-y-3">
            {ended.map((g) => <GenCard key={g.id} g={g} />)}
          </div>
        </div>
      )}

      {gens.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>Zatím žádné generace</p>
        </div>
      )}

      {editing && <GenerationEditModal generation={editing} onUpdated={handleUpdated} onClose={() => setEditing(null)} />}
      {endingId && (
        <ConfirmModal
          message="Ukončit tuto generaci k dnešnímu dni?"
          confirmLabel="Ukončit"
          onConfirm={() => handleEnd(endingId)}
          onCancel={() => setEndingId(null)}
        />
      )}
    </div>
  )
}
