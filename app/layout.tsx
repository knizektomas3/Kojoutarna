import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kojoutárna",
  description: "Evidence slepic, snášky a financí",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
