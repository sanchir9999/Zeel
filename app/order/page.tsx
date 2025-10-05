'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, Order, OrderItem } from '@/lib/types'

export default function OrderPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [customerName, setCustomerName] = useState('')
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [showProductModal, setShowProductModal] = useState(false)

    // Категориуд
    const categories = [
        { id: 'all', name: 'Бүгд' },
        { id: 'drinks', name: 'Ундаа' },
        { id: 'food', name: 'Хоол' },
        { id: 'snacks', name: 'Зууш' },
        { id: 'dairy', name: 'Сүүн бүтээгдэхүүн' },
        { id: 'cleaning', name: 'Цэвэрлэх хэрэгсэл' },
        { id: 'personal', name: 'Хувийн хэрэгцээ' }
    ]

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadAllProducts()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadAllProducts = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const stores = ['main', 'mangas', 'warehouse255']
            const allProducts: Product[] = []

            for (const storeId of stores) {
                try {
                    const storeProducts = await DataClient.getProducts(storeId)
                    const productsWithStore = storeProducts.map((p: Product) => ({
                        ...p,
                        storeId: storeId
                    }))
                    allProducts.push(...productsWithStore)
                } catch (error) {
                    console.error(`Error loading products from ${storeId}:`, error)
                }
            }

            setProducts(allProducts)
            setFilteredProducts(allProducts)
        } catch (error) {
            console.error('Error loading products:', error)
        }
    }

    // Хайлт болон шүүлт
    useEffect(() => {
        let filtered = products

        // Категори шүүлт
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory)
        }

        // Текст хайлт
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.size && product.size.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        setFilteredProducts(filtered)
    }, [searchTerm, selectedCategory, products])

    // Захиалгад бараа нэмэх
    const addToOrder = (product: Product, quantity: number = 1) => {
        const existingItem = orderItems.find(item => item.productId === product.id)

        if (existingItem) {
            setOrderItems(orderItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
                    : item
            ))
        } else {
            const newItem: OrderItem = {
                productId: product.id,
                productName: `${product.name}${product.size ? ` ${product.size}` : ''}${product.variant ? ` ${product.variant}` : ''}`,
                quantity: quantity,
                price: product.price,
                total: quantity * product.price
            }
            setOrderItems([...orderItems, newItem])
        }
        setShowProductModal(false)
    }

    // Захиалгаас бараа хасах
    const removeFromOrder = (productId: string) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId))
    }

    // Тоо ширхэг өөрчлөх
    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromOrder(productId)
        } else {
            setOrderItems(orderItems.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
                    : item
            ))
        }
    }

    // Нийт дүн тооцох
    const getTotalAmount = () => {
        return orderItems.reduce((sum, item) => sum + item.total, 0)
    }

    // Захиалга хадгалах
    const saveOrder = async () => {
        if (!customerName.trim()) {
            alert('Харилцагчийн нэр оруулна уу')
            return
        }

        if (orderItems.length === 0) {
            alert('Захиалгад бараа нэмнэ үү')
            return
        }

        try {
            const order: Order = {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerName: customerName.trim(),
                items: orderItems,
                totalAmount: getTotalAmount(),
                date: new Date().toISOString(),
                storeId: 'main', // Үндсэн дэлгүүр
                status: 'completed'
            }

            // localStorage-д шууд хадгалах
            const existingOrders = localStorage.getItem('orders')
            const orders = existingOrders ? JSON.parse(existingOrders) : []
            orders.push(order)
            localStorage.setItem('orders', JSON.stringify(orders))

            // Захиалга амжилттай хадгалагдсан
            alert('Захиалга амжилттай хадгалагдлаа!')
            setCustomerName('')
            setOrderItems([])
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Захиалга хадгалахад алдаа гарлаа')
        }
    }

    // Захиалга хэвлэх
    const printOrder = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const orderHtml = `
            <html>
            <head>
                <title>Захиалга #${Date.now()}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .customer { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; font-size: 18px; }
                    .date { margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Store POS - Захиалгын баримт</h2>
                </div>
                <div class="customer">
                    <strong>Харилцагч:</strong> ${customerName}<br>
                    <strong>Огноо:</strong> ${new Date().toLocaleDateString('mn-MN')} ${new Date().toLocaleTimeString('mn-MN')}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Барааны нэр</th>
                            <th>Тоо ширхэг</th>
                            <th>Нэгж үнэ</th>
                            <th>Нийт үнэ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItems.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price.toLocaleString()}₮</td>
                                <td>${item.total.toLocaleString()}₮</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total">
                            <td colspan="4">Нийт дүн:</td>
                            <td>${getTotalAmount().toLocaleString()}₮</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="date">
                    <p>Баярлалаа!</p>
                </div>
            </body>
            </html>
        `

        printWindow.document.write(orderHtml)
        printWindow.document.close()
        printWindow.print()
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <h1 className="text-xl text-gray-600 mt-4">Ачааллаж байна...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm font-medium">Буцах</span>
                        </Link>

                        <h1 className="text-lg font-semibold text-gray-900">🛒 Захиалга</h1>

                        <div className="w-10"></div> {/* Spacer */}
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row h-screen">
                {/* Барааны жагсаалт - зүүн талд */}
                <div className="lg:w-2/3 p-4">
                    {/* Хайлт болон шүүлт */}
                    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <div className="space-y-4">
                            {/* Хайлтын талбар */}
                            <input
                                type="text"
                                placeholder="Бараа хайх (нэр, брэнд, хэмжээ...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                            />

                            {/* Категори шүүлт */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Барааны grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                                    {product.brand && (
                                        <p className="text-xs text-gray-500">Брэнд: {product.brand}</p>
                                    )}
                                    {product.size && (
                                        <p className="text-xs text-blue-600">Хэмжээ: {product.size}</p>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 font-bold">{product.price.toLocaleString()}₮</span>
                                        <span className="text-xs text-gray-500">Үлдэгдэл: {product.quantity}</span>
                                    </div>
                                    <button
                                        onClick={() => addToOrder(product)}
                                        disabled={product.quantity === 0}
                                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {product.quantity === 0 ? 'Дууссан' : 'Нэмэх'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Захиалгын хэсэг - баруун талд */}
                <div className="lg:w-1/3 bg-white border-l p-4">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Захиалга</h2>

                        {/* Харилцагчийн нэр */}
                        <input
                            type="text"
                            placeholder="Харилцагчийн нэр"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
                        />

                        {/* Захиалгын жагсаалт */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {orderItems.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Захиалга хоосон байна</p>
                            ) : (
                                orderItems.map((item) => (
                                    <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-sm text-gray-900">{item.productName}</h4>
                                            <button
                                                onClick={() => removeFromOrder(item.productId)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-6 h-6 bg-gray-200 rounded text-xs"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-6 h-6 bg-blue-500 text-white rounded text-xs"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-green-600 font-bold text-sm">{item.total.toLocaleString()}₮</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Нийт дүн */}
                        {orderItems.length > 0 && (
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Нийт дүн:</span>
                                    <span className="text-xl font-bold text-green-600">{getTotalAmount().toLocaleString()}₮</span>
                                </div>

                                {/* Товчууд */}
                                <div className="space-y-2">
                                    <button
                                        onClick={saveOrder}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                                    >
                                        Захиалга хадгалах
                                    </button>
                                    <button
                                        onClick={printOrder}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                                    >
                                        🖨️ Хэвлэх
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}