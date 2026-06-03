'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusCircle, LogOut, Heart, TrendingUp, Target, Wallet,
  Plane, ShoppingBag, Star, Utensils, Edit2, Trash2, X,
  Check, ChevronDown, DollarSign, Calendar, MapPin, Sparkles,
  Trophy, PiggyBank, ArrowUpCircle
} from 'lucide-react'

type Category = 'travel' | 'shopping' | 'experiences' | 'food'
type Status = 'dream' | 'planned' | 'saving' | 'done'
type Priority = 'low' | 'medium' | 'high'

interface BucketItem {
  id: string
  title: string
  description: string
  category: Category
  targetAmount: number
  savedAmount: number
  status: Status
  priority: Priority
  emoji: string
  location?: string
  targetDate?: string
  createdAt: string
}

interface SavingsData {
  totalSaved: number
  monthlyTarget: number
  lastUpdated: string
}

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; color: string; bg: string; border: string; emoji: string }[] = [
  { key: 'travel', label: 'Travel', icon: <Plane size={18} />, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', emoji: '✈️' },
  { key: 'shopping', label: 'Buy', icon: <ShoppingBag size={18} />, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', emoji: '🛍️' },
  { key: 'experiences', label: 'Experiences', icon: <Star size={18} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', emoji: '🎯' },
  { key: 'food', label: 'Food', icon: <Utensils size={18} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', emoji: '🍽️' },
]

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  dream:   { label: '💭 Dreaming',  color: 'text-purple-600', bg: 'bg-purple-100' },
  planned: { label: '📋 Planned',   color: 'text-blue-600',   bg: 'bg-blue-100' },
  saving:  { label: '💰 Saving',    color: 'text-amber-600',  bg: 'bg-amber-100' },
  done:    { label: '✅ Done!',     color: 'text-emerald-600', bg: 'bg-emerald-100' },
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: '🔵 Low',    color: 'text-blue-500' },
  medium: { label: '🟡 Medium', color: 'text-amber-500' },
  high:   { label: '🔴 High',   color: 'text-rose-500' },
}

const EMOJIS = ['✈️','🏖️','🏔️','🗼','🎡','🌊','🍣','🍷','🛍️','💍','🚗','🏠','🎪','🎭','🎢','🏄','🤿','🎸','🌺','🦁','🐘','🦒','🌋','🏯','🎑']

const defaultForm = {
  title: '', description: '', category: 'travel' as Category,
  targetAmount: '', savedAmount: '', status: 'dream' as Status,
  priority: 'medium' as Priority, emoji: '✈️', location: '', targetDate: '',
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export default function Dashboard() {
  const router = useRouter()
  const [items, setItems] = useState<BucketItem[]>([])
  const [savings, setSavings] = useState<SavingsData>({ totalSaved: 0, monthlyTarget: 0, lastUpdated: '' })
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [activeStatus, setActiveStatus] = useState<Status | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [showSavingsModal, setShowSavingsModal] = useState(false)
  const [savingsForm, setSavingsForm] = useState({ totalSaved: '', monthlyTarget: '', addAmount: '', note: '' })
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [itemsRes, savingsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/savings'),
      ])
      if (itemsRes.status === 401 || savingsRes.status === 401) {
        router.push('/')
        return
      }
      const itemsData = await itemsRes.json()
      const savingsData = await savingsRes.json()
      setItems(itemsData.items || [])
      setSavings(savingsData.savings || { totalSaved: 0, monthlyTarget: 0, lastUpdated: '' })
    } catch {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(defaultForm)
    setShowForm(true)
  }

  const openEdit = (item: BucketItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title, description: item.description,
      category: item.category, targetAmount: String(item.targetAmount),
      savedAmount: String(item.savedAmount), status: item.status,
      priority: item.priority, emoji: item.emoji,
      location: item.location || '', targetDate: item.targetDate || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      targetAmount: Number(form.targetAmount) || 0,
      savedAmount: Number(form.savedAmount) || 0,
    }
    try {
      if (editingId) {
        await fetch(`/api/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      setShowForm(false)
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    setDeleting(null)
    await fetchAll()
  }

  const handleSavingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const current = savings
    const addAmount = Number(savingsForm.addAmount) || 0
    const payload: Partial<SavingsData> = {}
    if (savingsForm.totalSaved !== '') payload.totalSaved = Number(savingsForm.totalSaved)
    else if (addAmount) payload.totalSaved = current.totalSaved + addAmount
    if (savingsForm.monthlyTarget !== '') payload.monthlyTarget = Number(savingsForm.monthlyTarget)
    await fetch('/api/savings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowSavingsModal(false)
    setSavingsForm({ totalSaved: '', monthlyTarget: '', addAmount: '', note: '' })
    await fetchAll()
    setSaving(false)
  }

  const filtered = items.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    if (activeStatus !== 'all' && item.status !== activeStatus) return false
    return true
  })

  const totalTarget = items.reduce((s, i) => s + i.targetAmount, 0)
  const totalItemSaved = items.reduce((s, i) => s + i.savedAmount, 0)
  const doneCount = items.filter(i => i.status === 'done').length
  const overallProgress = totalTarget > 0 ? Math.min(100, (savings.totalSaved / totalTarget) * 100) : 0

  const getCat = (key: Category) => CATEGORIES.find(c => c.key === key)!

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl animate-float">🌴</div>
        <p className="text-teal-600 font-medium">Loading your dreams...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-teal-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-float">🌴</span>
            <div>
              <h1 className="font-display font-bold text-lg gradient-text leading-tight">Our Bucket List</h1>
              <p className="text-xs text-teal-500 flex items-center gap-1">
                <Heart size={10} fill="currentColor" className="text-rose-400" /> Dreams worth chasing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md hover:shadow-teal-200 hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Add Dream</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<Trophy className="text-amber-500" size={22} />}
            label="Completed"
            value={`${doneCount} / ${items.length}`}
            bg="from-amber-50 to-orange-50"
            border="border-amber-100"
          />
          <StatCard
            icon={<Target className="text-teal-500" size={22} />}
            label="Total Goal"
            value={formatCurrency(totalTarget)}
            bg="from-teal-50 to-emerald-50"
            border="border-teal-100"
          />
          <button
            onClick={() => { setShowSavingsModal(true); setSavingsForm({ totalSaved: '', monthlyTarget: String(savings.monthlyTarget || ''), addAmount: '', note: '' }) }}
            className="col-span-1 text-left"
          >
            <StatCard
              icon={<PiggyBank className="text-emerald-500" size={22} />}
              label="Total Saved"
              value={formatCurrency(savings.totalSaved)}
              bg="from-emerald-50 to-teal-50"
              border="border-emerald-100"
              clickable
            />
          </button>
          <StatCard
            icon={<TrendingUp className="text-violet-500" size={22} />}
            label="Progress"
            value={`${overallProgress.toFixed(0)}%`}
            bg="from-violet-50 to-purple-50"
            border="border-violet-100"
          />
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles size={15} className="text-amber-400" /> Overall Savings Progress
            </span>
            <span className="text-xs text-teal-600 font-medium">{formatCurrency(savings.totalSaved)} / {formatCurrency(totalTarget)}</span>
          </div>
          <div className="h-4 bg-teal-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          {savings.monthlyTarget > 0 && (
            <p className="text-xs text-teal-500 mt-2 flex items-center gap-1">
              <ArrowUpCircle size={12} /> Monthly savings target: {formatCurrency(savings.monthlyTarget)}
            </p>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <TabBtn active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label="🌟 All" count={items.length} />
          {CATEGORIES.map(c => (
            <TabBtn
              key={c.key}
              active={activeCategory === c.key}
              onClick={() => setActiveCategory(c.key)}
              label={`${c.emoji} ${c.label}`}
              count={items.filter(i => i.category === c.key).length}
            />
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'dream', 'planned', 'saving', 'done'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeStatus === s
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-teal-200'
              }`}
            >
              {s === 'all' ? '✨ All Status' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-float">🌴</div>
            <h3 className="text-xl font-bold text-teal-600 mb-2">No dreams here yet!</h3>
            <p className="text-teal-400 text-sm mb-6">Start adding your adventures and goals</p>
            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg hover:shadow-teal-200 hover:scale-105 transition-all"
            >
              + Add First Dream
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.id)}
                deleting={deleting === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editingId ? '✏️ Edit Dream' : '✨ Add New Dream'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emoji picker */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pick an emoji</label>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-teal-100 hover:border-teal-300 bg-teal-50 transition-colors"
              >
                <span className="text-2xl">{form.emoji}</span>
                <ChevronDown size={14} className="text-teal-400" />
              </button>
              {showEmojiPicker && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-teal-100 shadow-lg flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <FormInput label="Title *" required>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Bali Honeymoon Trip"
                className="form-field"
              />
            </FormInput>

            <FormInput label="Description">
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Tell the story of this dream..."
                rows={2}
                className="form-field resize-none"
              />
            </FormInput>

            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Category">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} className="form-field">
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
                </select>
              </FormInput>
              <FormInput label="Status">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))} className="form-field">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </FormInput>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Target Amount (₹)">
                <input
                  type="number"
                  min="0"
                  value={form.targetAmount}
                  onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                  placeholder="50000"
                  className="form-field"
                />
              </FormInput>
              <FormInput label="Saved So Far (₹)">
                <input
                  type="number"
                  min="0"
                  value={form.savedAmount}
                  onChange={e => setForm(f => ({ ...f, savedAmount: e.target.value }))}
                  placeholder="10000"
                  className="form-field"
                />
              </FormInput>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Priority">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className="form-field">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </FormInput>
              <FormInput label="Location (optional)">
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Maldives, Tokyo..."
                  className="form-field"
                />
              </FormInput>
            </div>

            <FormInput label="Target Date (optional)">
              <input
                type="date"
                value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                className="form-field"
              />
            </FormInput>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-md hover:shadow-teal-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? '✅ Update' : '🌟 Add Dream'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Savings Modal */}
      {showSavingsModal && (
        <Modal onClose={() => setShowSavingsModal(false)} title="💰 Update Savings">
          <form onSubmit={handleSavingsUpdate} className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 text-center border border-emerald-100">
              <p className="text-sm text-teal-600 mb-1">Current Savings</p>
              <p className="text-3xl font-bold gradient-text">{formatCurrency(savings.totalSaved)}</p>
            </div>

            <FormInput label="➕ Add to Savings (₹)">
              <input
                type="number"
                min="0"
                value={savingsForm.addAmount}
                onChange={e => setSavingsForm(f => ({ ...f, addAmount: e.target.value, totalSaved: '' }))}
                placeholder="Add amount this month..."
                className="form-field"
              />
            </FormInput>

            <div className="text-center text-sm text-gray-400">— or set exact total —</div>

            <FormInput label="Set Total Savings (₹)">
              <input
                type="number"
                min="0"
                value={savingsForm.totalSaved}
                onChange={e => setSavingsForm(f => ({ ...f, totalSaved: e.target.value, addAmount: '' }))}
                placeholder="Set exact amount..."
                className="form-field"
              />
            </FormInput>

            <FormInput label="Monthly Target (₹)">
              <input
                type="number"
                min="0"
                value={savingsForm.monthlyTarget}
                onChange={e => setSavingsForm(f => ({ ...f, monthlyTarget: e.target.value }))}
                placeholder="How much to save each month"
                className="form-field"
              />
            </FormInput>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowSavingsModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
                {saving ? 'Saving...' : '💾 Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, bg, border, clickable }: {
  icon: React.ReactNode; label: string; value: string; bg: string; border: string; clickable?: boolean
}) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl p-4 border ${border} shadow-sm card-hover ${clickable ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>{icon}</div>
        {clickable && <span className="text-xs text-teal-400 font-medium">tap to edit</span>}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-lg font-bold text-gray-800 truncate">{value}</p>
    </div>
  )
}

function TabBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md'
          : 'bg-white text-gray-500 border border-gray-100 hover:border-teal-200'
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
        {count}
      </span>
    </button>
  )
}

function ItemCard({ item, onEdit, onDelete, deleting }: {
  item: BucketItem; onEdit: () => void; onDelete: () => void; deleting: boolean
}) {
  const cat = CATEGORIES.find(c => c.key === item.category)!
  const status = STATUS_CONFIG[item.status]
  const progress = item.targetAmount > 0 ? Math.min(100, (item.savedAmount / item.targetAmount) * 100) : 0
  const isDone = item.status === 'done'

  const progressColor = progress >= 100
    ? 'from-emerald-400 to-green-400'
    : progress >= 50
    ? 'from-teal-400 to-emerald-400'
    : 'from-amber-400 to-orange-400'

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border card-hover relative overflow-hidden ${isDone ? 'border-emerald-200' : 'border-gray-100'}`}>
      {/* Done ribbon */}
      {isDone && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          <Check size={16} className="text-emerald-600" />
        </div>
      )}

      {/* Category badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.color} ${cat.border} border mb-3`}>
        {cat.icon} {cat.label}
      </div>

      {/* Title */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl flex-shrink-0">{item.emoji}</span>
        <h3 className="font-bold text-gray-800 leading-tight">{item.title}</h3>
      </div>

      {item.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
      )}

      {item.location && (
        <p className="text-xs text-teal-500 flex items-center gap-1 mb-2">
          <MapPin size={11} /> {item.location}
        </p>
      )}

      {item.targetDate && (
        <p className="text-xs text-violet-500 flex items-center gap-1 mb-2">
          <Calendar size={11} /> {new Date(item.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.bg} ${status.color}`}>
          {status.label}
        </span>
        <span className={`text-xs font-medium ${PRIORITY_CONFIG[item.priority].color}`}>
          {PRIORITY_CONFIG[item.priority].label}
        </span>
      </div>

      {/* Savings progress */}
      {item.targetAmount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>₹{item.savedAmount.toLocaleString('en-IN')} saved</span>
            <span>₹{item.targetAmount.toLocaleString('en-IN')} goal</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor} progress-fill`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{progress.toFixed(0)}%</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-teal-50 text-teal-600 text-xs font-semibold hover:bg-teal-100 transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} /> {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-3xl">
          <h2 className="font-bold text-lg text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function FormInput({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  )
}
