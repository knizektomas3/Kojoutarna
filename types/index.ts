export type Generation = {
  id: string
  user_id: string
  name: string
  breed: string | null
  started_at: string
  ended_at: string | null
  hen_count: number | null
  notes: string | null
  created_at: string
}

export type Production = {
  id: string
  user_id: string
  generation_id: string
  date: string
  egg_count: number
  created_at: string
  generation?: Generation
}

export type Income = {
  id: string
  user_id: string
  generation_id: string
  date: string
  income_type: string
  amount: number
  customer_name: string | null
  customer_type: string | null
  created_at: string
  generation?: Generation
}

export type Cost = {
  id: string
  user_id: string
  generation_id: string
  date: string
  cost_category: 'Pořizovací' | 'Provozní'
  cost_subcategory: string
  amount: number
  notes: string | null
  created_at: string
  generation?: Generation
}

export type Cashflow = {
  generation_id: string
  generation_name: string
  total_income: number
  acquisition_cost: number
  operational_cost: number
  total_cost: number
  operational_profit: number
  total_profit: number
}
