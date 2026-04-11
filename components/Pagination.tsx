'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function Pagination({
  page,
  total,
  pageSize,
}: {
  page: number
  total: number
  pageSize: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  // Výpočet viditelných stránek (max 5 kolem aktuální)
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between mt-3">
      <span className="text-sm text-gray-400">
        {from}–{to} z {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 rounded-lg text-sm border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p as number)}
              className={`w-8 h-8 rounded-lg text-sm border transition-colors cursor-pointer ${
                p === page
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 rounded-lg text-sm border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
        >
          →
        </button>
      </div>
    </div>
  )
}
