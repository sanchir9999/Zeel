import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/database'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const targetDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

        // Get all orders
        const orders = await OrderService.getAll()

        // Filter orders for the target date
        const dailyOrders = orders.filter(order => {
            const orderDate = new Date(order.date).toISOString().split('T')[0]
            return orderDate === targetDate && order.status === 'completed'
        })

        // Calculate total revenue
        const revenue = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0)

        return NextResponse.json({ date: targetDate, revenue })
    } catch (error) {
        console.error('Error fetching daily revenue:', error)
        return NextResponse.json(
            { error: 'Failed to fetch daily revenue' },
            { status: 500 }
        )
    }
}