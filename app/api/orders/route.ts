import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/database'

export async function GET() {
    try {
        const orders = await OrderService.getAll()
        return NextResponse.json(orders)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { customerName, items, totalAmount, storeId } = body

        if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Invalid order data' },
                { status: 400 }
            )
        }

        const order = await OrderService.add({
            customerName,
            items,
            totalAmount: Number(totalAmount),
            date: new Date().toISOString(),
            storeId: storeId || 'main',
            status: 'completed'
        })

        return NextResponse.json(order, { status: 201 })
    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            )
        }

        const success = await OrderService.deleteById(orderId)

        if (success) {
            return NextResponse.json({ message: 'Order deleted successfully' })
        } else {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }
    } catch (error) {
        console.error('Error deleting order:', error)
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        )
    }
}