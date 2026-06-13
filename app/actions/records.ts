'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduction(data: {
  generation_id: string
  date: string
  egg_count: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('productions').upsert({
    user_id: user.id,
    ...data,
  }, { onConflict: 'user_id,generation_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}

export async function createIncome(data: {
  generation_id: string
  date: string
  amount: number
  customer_name: string | null
  customer_type: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('incomes').insert({
    user_id: user.id,
    income_type: 'Prodej',
    ...data,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
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
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('costs').insert({
    user_id: user.id,
    ...data,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}

export async function deleteProduction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('productions').delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}

export async function deleteIncome(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('incomes').delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}

export async function deleteCost(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const { error } = await supabase.from('costs').delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return {}
}

export async function endGeneration(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nejste přihlášen' }

  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('generations').update({ ended_at: today })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { }
}
