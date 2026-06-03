'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Heart, Palmtree } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Wrong password, love! Try again 💕')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg mb-4 animate-float">
              <span className="text-4xl">🌴</span>
            </div>
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">
              Our Bucket List
            </h1>
            <p className="text-teal-600 flex items-center justify-center gap-1 text-sm">
              <Heart size={14} fill="currentColor" className="text-rose-400" />
              <span>Dreams worth chasing together</span>
              <Heart size={14} fill="currentColor" className="text-rose-400" />
            </p>
          </div>

          {/* Floating emojis */}
          <div className="flex justify-center gap-3 mb-8">
            {['✈️', '🏔️', '🍜', '🛍️', '🎡', '🌊'].map((emoji, i) => (
              <span
                key={i}
                className="text-2xl animate-float"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your secret password..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-teal-100 focus:border-teal-400 focus:outline-none bg-teal-50/50 text-gray-700 placeholder-teal-300 text-sm font-medium transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-rose-500 text-sm text-center bg-rose-50 rounded-xl py-2 px-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base shadow-lg hover:shadow-teal-200/60 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
            >
              {loading ? '✨ Opening...' : "Let's Dream Together! 🌟"}
            </button>
          </form>

          <p className="text-center text-xs text-teal-400 mt-6">
            Shared between you and your wife 💑
          </p>
        </div>
      </div>
    </div>
  )
}
