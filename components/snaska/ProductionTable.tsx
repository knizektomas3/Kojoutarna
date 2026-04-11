'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Production } from '@/types'

export default function ProductionTable({ productions }: { productions: Production[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Smazat tento záznam?')) return
    setDeleting(id)
    await supabase.from('productions').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  if (productions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-gray-400 text-sm text-center py-4">Žádné záznamy</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Datum</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Generace</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Vajec</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {productions.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(p.date).toLocaleDateString('cs-CZ')}</td>
                <td className="px-4 py-3 text-gray-600">{(p.generation as any)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-right font-medium">{p.egg_count}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-gray-300 hover:text-red-400 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
