'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export type FilterField =
  | { type: 'date-range' }
  | { type: 'select'; key: string; label: string; options: { value: string; label: string }[] }

export default function FilterBar({
  fields,
  resultCount,
}: {
  fields: FilterField[]
  resultCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const set = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const reset = () => router.push(pathname)
  const hasFilters = searchParams.toString() !== ''

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {fields.map((field) => {
          if (field.type === 'date-range') {
            return (
              <div key="date-range" className="flex gap-2 items-end flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-[130px]">
                  <label className="field-label">Od</label>
                  <input
                    type="date"
                    value={searchParams.get('from') ?? ''}
                    onChange={(e) => set('from', e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="field-label">Do</label>
                  <input
                    type="date"
                    value={searchParams.get('to') ?? ''}
                    onChange={(e) => set('to', e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>
            )
          }

          return (
            <div key={field.key} className="min-w-[130px]">
              <label className="field-label">{field.label}</label>
              <select
                value={searchParams.get(field.key) ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                className="field-input"
              >
                <option value="">Vše</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )
        })}

        {hasFilters && (
          <div className="flex items-end ml-auto">
            <button
              onClick={reset}
              className="text-sm font-medium pb-1.5 transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Zrušit filtry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
