'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/', label: 'Přehled', icon: '📊' },
  { href: '/snaska', label: 'Snáška', icon: '🥚' },
  { href: '/prijmy', label: 'Příjmy', icon: '💰' },
  { href: '/naklady', label: 'Náklady', icon: '🛒' },
  { href: '/import', label: 'Import CSV', icon: '📁' },
]

export default function Navigation({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="bg-amber-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">🐔 Kojoutárna</span>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-amber-700 text-white'
                      : 'text-amber-100 hover:bg-amber-800'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-200 text-sm hidden sm:block">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-md transition-colors"
            >
              Odhlásit
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className="sm:hidden flex overflow-x-auto gap-1 pb-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-800'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
