'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Delete } from 'lucide-react'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  const handleKey = async (key: string) => {
    if (loading) return
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
      setError('')
      return
    }
    if (key === '') return
    if (pin.length >= 4) return

    const newPin = pin + key
    setPin(newPin)

    if (newPin.length === 4) {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPin }),
        })
        if (res.ok) {
          router.push('/dashboard')
        } else {
          setShake(true)
          setTimeout(() => { setShake(false); setPin(''); setError('Wrong PIN, try again 💕') }, 600)
        }
      } catch {
        setError('Something went wrong.')
        setPin('')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg mb-4 animate-float">
              <span className="text-4xl">🌴</span>
            </div>
            <h1 className="font-display text-3xl font-bold gradient-text mb-1">Our Bucket List</h1>
            <p className="text-teal-500 flex items-center justify-center gap-1 text-sm">
              <Heart size={12} fill="currentColor" className="text-rose-400" />
              Enter your 4-digit PIN
              <Heart size={12} fill="currentColor" className="text-rose-400" />
            </p>
          </div>

          {/* PIN dots */}
          <div className={`flex justify-center gap-4 mb-6 ${shake ? 'animate-bounce' : ''}`}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  i < pin.length
                    ? 'bg-gradient-to-br from-teal-400 to-emerald-500 border-teal-400 scale-110'
                    : 'border-teal-200 bg-teal-50'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-rose-500 text-xs text-center bg-rose-50 rounded-xl py-2 px-4 mb-4">
              {error}
            </p>
          )}

          {/* Number pad */}
          <div className="grid grid-rows-4 gap-3">
            {KEYS.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((key, ki) => (
                  <button
                    key={ki}
                    onClick={() => handleKey(key)}
                    disabled={key === '' || loading}
                    className={`
                      h-16 rounded-2xl font-bold text-xl transition-all duration-150 select-none
                      ${key === '' ? 'invisible' : ''}
                      ${key === 'del'
                        ? 'bg-rose-50 text-rose-400 hover:bg-rose-100 active:scale-90 border border-rose-100'
                        : 'bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-700 hover:from-teal-100 hover:to-emerald-100 active:scale-90 border border-teal-100 shadow-sm hover:shadow-md'
                      }
                    `}
                  >
                    {key === 'del' ? <Delete size={20} className="mx-auto" /> : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-teal-400 mt-6">
            Shared between you and your wife 💑
          </p>
        </div>
      </div>
    </div>
  )
}
