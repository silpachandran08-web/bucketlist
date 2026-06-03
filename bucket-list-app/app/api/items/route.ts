import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getAllItems, addItem, BucketItem } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const items = await getAllItems()
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const item: BucketItem = {
      id: uuidv4(),
      title: body.title,
      description: body.description || '',
      category: body.category,
      targetAmount: Number(body.targetAmount) || 0,
      savedAmount: Number(body.savedAmount) || 0,
      status: body.status || 'dream',
      priority: body.priority || 'medium',
      emoji: body.emoji || '⭐',
      location: body.location || '',
      targetDate: body.targetDate || '',
      createdAt: now,
      updatedAt: now,
    }
    await addItem(item)
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
