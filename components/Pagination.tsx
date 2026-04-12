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

  const btnBase: React.CSSProperties = {
    borderRadius: '0.5rem',
    border: '1px solid var(--border)',
    fontSize: '0.8125rem',
    transition: 'background-color 0.1s, color 0.1s',
    cursor: 'pointer',
  }

  return (
    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
      <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
        {from}–{to} z {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          style={{ ...btnBase, padding: '0.25rem 0.625rem', opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
          onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.backgroundColor = 'var(--surface-alt)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: 'var(--text-subtle)' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p as number)}
              style={
                p === page
                  ? { ...btnBase, width: '2rem', height: '2rem', backgroundColor: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'var(--accent)', fontWeight: 600 }
                  : { ...btnBase, width: '2rem', height: '2rem', color: 'var(--text)' }
              }
              onMouseEnter={(e) => { if (p !== page) e.currentTarget.style.backgroundColor = 'var(--surface-alt)' }}
              onMouseLeave={(e) => { if (p !== page) e.currentTarget.style.backgroundColor = '' }}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          style={{ ...btnBase, padding: '0.25rem 0.625rem', opacity: page === totalPages ? 0.3 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}
          onMouseEnter={(e) => { if (page !== totalPages) e.currentTarget.style.backgroundColor = 'var(--surface-alt)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
        >
          →
        </button>
      </div>
    </div>
  )
}
