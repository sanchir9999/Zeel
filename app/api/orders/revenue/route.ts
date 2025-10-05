import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/redis-orders'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

        const revenue = await OrderService.getDailyRevenue(date)
        return NextResponse.json({ date, revenue })
    } catch (error) {
        console.error('Error fetching daily revenue:', error)
        return NextResponse.json(
            { error: 'Failed to fetch daily revenue' },
            { status: 500 }
        )
    }
}