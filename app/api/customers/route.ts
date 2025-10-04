import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/lib/database'

export async function GET() {
    try {
        const customers = await CustomerService.getAll()
        return NextResponse.json(customers)
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, phone } = body

        if (!name || !phone) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            )
        }

        const customer = await CustomerService.add({
            name,
            phone,
            joinDate: new Date().toLocaleDateString('mn-MN'),
            totalPurchases: 0
        })

        return NextResponse.json(customer, { status: 201 })
    } catch (error) {
        console.error('Error creating customer:', error)
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get('customerId')

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        await CustomerService.delete(customerId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        )
    }
}