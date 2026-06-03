import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🌴 Our Bucket List',
  description: 'Our dreams, adventures & goals — together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {children}
      </body>
    </html>
  )
}
