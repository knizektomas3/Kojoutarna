import { createClient } from '@/lib/supabase/server'
import ImportForm from '@/components/import/ImportForm'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user!.id)
    .order('started_at')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">📁 Import CSV</h1>
        <p className="text-gray-500 text-sm mt-1">Jednorázový import dat z Tabidoo. Formát: středníkový CSV.</p>
      </div>
      <ImportForm generations={generations ?? []} />
    </div>
  )
}
