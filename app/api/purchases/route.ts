import { NextRequest, NextResponse } from 'next/server'
import { PurchaseService } from '@/lib/database'

export async function GET() {
    try {
        const purchases = await PurchaseService.getAll()
        return NextResponse.json(purchases)
    } catch (error) {
        console.error('Error fetching purchases:', error)
        return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { customerId, customerName, items, totalAmount, store } = body

        if (!customerId || !items || !totalAmount || !store) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const purchase = await PurchaseService.add({
            customerId,
            customerName,
            productName: items[0]?.name || 'Unknown',
            storeId: 'unknown',
            storeName: store,
            quantity: items[0]?.quantity || 1,
            price: items[0]?.price || 0,
            totalAmount: Number(totalAmount),
            date: new Date().toLocaleDateString('mn-MN')
        })

        return NextResponse.json(purchase, { status: 201 })
    } catch (error) {
        console.error('Error creating purchase:', error)
        return NextResponse.json(
            { error: 'Failed to create purchase' },
            { status: 500 }
        )
    }
}