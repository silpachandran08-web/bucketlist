import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export type Category = 'travel' | 'shopping' | 'experiences' | 'food'
export type Status = 'dream' | 'planned' | 'saving' | 'done'

export interface BucketItem {
  id: string
  title: string
  description: string
  category: Category
  targetAmount: number
  savedAmount: number
  status: Status
  priority: 'low' | 'medium' | 'high'
  emoji: string
  location?: string
  targetDate?: string
  createdAt: string
  updatedAt: string
}

export interface SavingsData {
  totalSaved: number
  monthlyTarget: number
  lastUpdated: string
  history: { date: string; amount: number; note: string }[]
}

const ITEMS_KEY = 'bucket:items'
const SAVINGS_KEY = 'bucket:savings'

export async function getAllItems(): Promise<BucketItem[]> {
  const items = await redis.lrange<BucketItem>(ITEMS_KEY, 0, -1)
  return items || []
}

export async function addItem(item: BucketItem): Promise<void> {
  await redis.lpush(ITEMS_KEY, item)
}

export async function updateItem(id: string, updates: Partial<BucketItem>): Promise<boolean> {
  const items = await getAllItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return false
  const updated = { ...items[idx], ...updates, updatedAt: new Date().toISOString() }
  // Rebuild the list
  await redis.del(ITEMS_KEY)
  const allUpdated = [...items]
  allUpdated[idx] = updated
  if (allUpdated.length > 0) {
    await redis.rpush(ITEMS_KEY, ...allUpdated)
  }
  return true
}

export async function deleteItem(id: string): Promise<boolean> {
  const items = await getAllItems()
  const filtered = items.filter(i => i.id !== id)
  if (filtered.length === items.length) return false
  await redis.del(ITEMS_KEY)
  if (filtered.length > 0) {
    await redis.rpush(ITEMS_KEY, ...filtered)
  }
  return true
}

export async function getSavings(): Promise<SavingsData> {
  const data = await redis.get<SavingsData>(SAVINGS_KEY)
  return data || { totalSaved: 0, monthlyTarget: 0, lastUpdated: new Date().toISOString(), history: [] }
}

export async function updateSavings(data: Partial<SavingsData>): Promise<SavingsData> {
  const current = await getSavings()
  const updated = { ...current, ...data, lastUpdated: new Date().toISOString() }
  await redis.set(SAVINGS_KEY, updated)
  return updated
}
