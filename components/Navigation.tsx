'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from './ThemeProvider'

const links = [
  { href: '/', label: 'Přehled', icon: '📊' },
  { href: '/snaska', label: 'Snáška', icon: '🥚' },
  { href: '/prijmy', label: 'Příjmy', icon: '💰' },
  { href: '/naklady', label: 'Náklady', icon: '🛒' },
]

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Navigation({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggle } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav style={{ backgroundColor: 'var(--nav-bg)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--nav-text)' }}>
              🐔 Kojoutárna
            </span>
            <div className="hidden sm:flex items-center gap-0.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={
                    pathname === link.href
                      ? { backgroundColor: 'var(--nav-active)', color: 'var(--nav-text)' }
                      : { color: 'var(--nav-text)', opacity: 0.75 }
                  }
                  onMouseEnter={(e) => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = 'var(--nav-hover)'
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.opacity = '0.75'
                    }
                  }}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--nav-text)', opacity: 0.6 }}>
              {userEmail}
            </span>

            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Světlý režim' : 'Tmavý režim'}
              className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'var(--nav-text)', opacity: 0.75 }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.opacity = '0.75' }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
              style={{ color: 'var(--nav-text)', opacity: 0.75 }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--nav-hover)'; e.currentTarget.style.opacity = '1' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.opacity = '0.75' }}
            >
              Odhlásit
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden flex overflow-x-auto gap-0.5 pb-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={
                pathname === link.href
                  ? { backgroundColor: 'var(--nav-active)', color: 'var(--nav-text)' }
                  : { color: 'var(--nav-text)', opacity: 0.75 }
              }
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
