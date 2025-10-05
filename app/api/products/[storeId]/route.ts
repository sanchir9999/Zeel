import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/database'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params
        const products = await ProductService.getAll(storeId)
        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params
        const body = await request.json()
        const { name, quantity, price } = body

        if (!name || quantity < 0 || price < 0) {
            return NextResponse.json(
                { error: 'Invalid product data' },
                { status: 400 }
            )
        }

        const product = await ProductService.add(storeId, {
            name,
            quantity: Number(quantity),
            price: Number(price),
            addedDate: new Date().toLocaleDateString('mn-MN'),
            category: 'general',
            storeId,
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params
        const body = await request.json()
        const { productId, ...updates } = body

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        await ProductService.update(storeId, productId, updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        await ProductService.delete(storeId, productId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}