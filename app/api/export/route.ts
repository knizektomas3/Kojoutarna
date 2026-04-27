import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ]
  return lines.join('\n')
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const [generations, productions, incomes, costs] = await Promise.all([
    supabase.from('generations').select('*').order('started_at'),
    supabase.from('productions').select('*').order('date'),
    supabase.from('incomes').select('*').order('date'),
    supabase.from('costs').select('*').order('date'),
  ])

  const sections = [
    { name: 'Generace', rows: generations.data ?? [] },
    { name: 'Snáška', rows: productions.data ?? [] },
    { name: 'Příjmy', rows: incomes.data ?? [] },
    { name: 'Náklady', rows: costs.data ?? [] },
  ]

  const content = sections
    .map(s => `### ${s.name}\n${toCSV(s.rows)}`)
    .join('\n\n')

  const date = new Date().toISOString().slice(0, 10)
  return new Response(content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kojoutarna-zaloha-${date}.csv"`,
    },
  })
}
