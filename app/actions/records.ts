'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createIncome(data: {
  generation_id: string
  date: string
  amount: number
  customer_name: string | null
  customer_type: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('incomes').insert({
    user_id: user!.id,
    income_type: 'Prodej',
    ...data,
  })

  if (error) return { error: error.message }

  revalidatePath('/prijmy')
  revalidatePath('/')
  return {}
}

export async function createCost(data: {
  generation_id: string
  date: string
  cost_category: string
  cost_subcategory: string
  amount: number
  notes: string | null
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('costs').insert({
    user_id: user!.id,
    ...data,
  })

  if (error) return { error: error.message }

  revalidatePath('/naklady')
  revalidatePath('/')
  return {}
}
