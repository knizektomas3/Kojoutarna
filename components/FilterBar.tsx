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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {fields.map((field) => {
          if (field.type === 'date-range') {
            return (
              <div key="date-range" className="flex gap-2 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Od</label>
                  <input
                    type="date"
                    value={searchParams.get('from') ?? ''}
                    onChange={(e) => set('from', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Do</label>
                  <input
                    type="date"
                    value={searchParams.get('to') ?? ''}
                    onChange={(e) => set('to', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            )
          }

          return (
            <div key={field.key}>
              <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
              <select
                value={searchParams.get(field.key) ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Vše</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )
        })}

        <div className="flex items-end gap-3 ml-auto">
          <span className="text-sm text-gray-400 pb-1.5">{resultCount} záznamů</span>
          {hasFilters && (
            <button
              onClick={reset}
              className="text-sm text-amber-700 hover:underline pb-1.5"
            >
              Zrušit filtry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
