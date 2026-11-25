import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/Toast'
import PwaInit from '@/components/PwaInit'
import './globals.css'

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700', '800'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Kojoutárna',
  description: 'Evidence slepic, snášky a financí',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kojoutárna',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`h-full ${font.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme'),p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider><ToastProvider><PwaInit />{children}</ToastProvider></ThemeProvider>
      </body>
    </html>
  )
}
