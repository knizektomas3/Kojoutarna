import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function parseCSV(csv: string): string[][] {
  const lines = csv.trim().split('\n').filter(Boolean)
  return lines.map((line) => line.split(';').map((cell) => cell.trim().replace(/^"|"$/g, '')))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const { type, csv } = await request.json()

  // Načti všechny generace uživatele pro mapování název → id
  const { data: generations } = await supabase
    .from('generations')
    .select('id, name')
    .eq('user_id', user.id)

  const genMap: Record<string, string> = {}
  for (const g of generations ?? []) {
    genMap[g.name.toLowerCase()] = g.id
  }

  const rows = parseCSV(csv)
  if (rows.length < 2) return NextResponse.json({ error: 'Prázdný soubor' }, { status: 400 })

  const dataRows = rows.slice(1)
  let imported = 0
  let skipped = 0
  const errors: string[] = []

  const resolveGen = (genName: string, rowNum: number): string | null => {
    const id = genMap[genName?.toLowerCase()]
    if (!id) {
      errors.push(`Řádek ${rowNum}: generace "${genName}" neexistuje — nejdřív ji vytvoř v aplikaci`)
      return null
    }
    return id
  }

  if (type === 'produkce') {
    // Datum;Počet snesených vajec;Generace
    for (let i = 0; i < dataRows.length; i++) {
      const [date, eggStr, genName] = dataRows[i]
      if (!date || !eggStr) continue
      const egg_count = parseInt(eggStr)
      if (isNaN(egg_count)) { errors.push(`Řádek ${i + 2}: neplatný počet vajec "${eggStr}"`); continue }
      const generation_id = resolveGen(genName, i + 2)
      if (!generation_id) continue

      const { error } = await supabase.from('productions').upsert(
        { user_id: user.id, generation_id, date, egg_count },
        { onConflict: 'user_id,generation_id,date' }
      )
      if (error) { skipped++; continue }
      imported++
    }
  } else if (type === 'prijmy') {
    // Datum;Příjmy;Částka;Zákazník;Typ zákazníka;Generace
    for (let i = 0; i < dataRows.length; i++) {
      const [date, income_type, amountStr, customer_name, customer_type, genName] = dataRows[i]
      if (!date || !amountStr) continue
      const amount = parseInt(amountStr)
      if (isNaN(amount)) { errors.push(`Řádek ${i + 2}: neplatná částka "${amountStr}"`); continue }
      const generation_id = resolveGen(genName, i + 2)
      if (!generation_id) continue

      const { error } = await supabase.from('incomes').insert({
        user_id: user.id, generation_id, date,
        income_type: income_type || 'Prodej',
        amount,
        customer_name: customer_name || null,
        customer_type: customer_type || null,
      })
      if (error) { errors.push(`Řádek ${i + 2}: ${error.message}`); continue }
      imported++
    }
  } else if (type === 'naklady') {
    // Datum;Náklad;Pořizovací náklady;Provozní náklady;Částka;Generace
    for (let i = 0; i < dataRows.length; i++) {
      const [date, category, acquisitionSub, operationalSub, amountStr, genName] = dataRows[i]
      if (!date || !amountStr) continue
      const amount = parseInt(amountStr)
      if (isNaN(amount)) { errors.push(`Řádek ${i + 2}: neplatná částka "${amountStr}"`); continue }
      const generation_id = resolveGen(genName, i + 2)
      if (!generation_id) continue

      const cost_category = category as 'Pořizovací' | 'Provozní'
      const cost_subcategory = category === 'Pořizovací' ? (acquisitionSub || 'Jiné') : (operationalSub || 'Jiné')

      const { error } = await supabase.from('costs').insert({
        user_id: user.id, generation_id, date, cost_category, cost_subcategory, amount,
      })
      if (error) { errors.push(`Řádek ${i + 2}: ${error.message}`); continue }
      imported++
    }
  } else {
    return NextResponse.json({ error: 'Neznámý typ importu' }, { status: 400 })
  }

  return NextResponse.json({ imported, skipped, errors })
}
