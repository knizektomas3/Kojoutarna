'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Generation } from '@/types'

type ImportType = 'produkce' | 'prijmy' | 'naklady'

export default function ImportForm({ generations }: { generations: Generation[] }) {
  const router = useRouter()
  const [type, setType] = useState<ImportType>('produkce')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Vyberte soubor'); return }
    setLoading(true)
    setError('')
    setResult(null)

    const text = await file.text()
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, csv: text }),
    })

    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'Chyba importu'); return }
    setResult(data)
    router.refresh()
  }

  const descriptions: Record<ImportType, string> = {
    produkce: 'Datum;Počet snesených vajec;Generace',
    prijmy: 'Datum;Příjmy;Částka;Zákazník;Typ zákazníka;Generace',
    naklady: 'Datum;Náklad;Pořizovací náklady;Provozní náklady;Částka;Generace',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Generace info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-2">Před importem zkontroluj, že máš vytvořené generace:</p>
          {generations.length === 0 ? (
            <p className="text-sm text-amber-700">⚠ Žádné generace — nejdřív je vytvoř na stránce Snáška.</p>
          ) : (
            <ul className="text-sm text-amber-700 space-y-0.5">
              {generations.map((g) => (
                <li key={g.id}>✓ <strong>{g.name}</strong></li>
              ))}
            </ul>
          )}
          <p className="text-xs text-amber-600 mt-2">
            Název generace v CSV musí přesně odpovídat názvu generace v aplikaci (např. „První", „Druhá").
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Typ dat</label>
              <div className="flex flex-col gap-2">
                {([['produkce', '🥚 Produkce (snáška)'], ['prijmy', '💰 Příjmy'], ['naklady', '🛒 Náklady']] as const).map(([val, label]) => (
                  <label key={val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    type === val ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="type" value={val} checked={type === val} onChange={() => setType(val)} className="accent-amber-700" />
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-gray-400 font-mono">{descriptions[val]}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">CSV soubor</label>
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-700 file:text-white hover:file:bg-amber-600" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading || generations.length === 0}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
              {loading ? 'Importuji…' : 'Spustit import'}
            </button>
          </form>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Výsledek importu</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-green-600">{result.imported}</span>
              <span className="text-gray-500">záznamů importováno</span>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-amber-600">{result.skipped}</span>
                <span className="text-gray-500">přeskočeno (duplicity)</span>
              </div>
            )}
            {result.errors.length > 0 && (
              <div>
                <p className="text-sm text-red-500 font-medium mb-1">Chyby ({result.errors.length}):</p>
                <ul className="text-xs text-red-400 space-y-1 max-h-60 overflow-y-auto">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
