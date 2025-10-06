'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Order, OrderItem, Customer } from '@/lib/types'

export default function OrderPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [customerName, setCustomerName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showProductModal, setShowProductModal] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paidAmount, setPaidAmount] = useState(0)
    const [payments, setPayments] = useState<{ amount: number; date: string }[]>([])

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadAllProducts()
            loadCustomers()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadAllProducts = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const allProducts: Product[] = []

            // Load from all stores
            const stores = ['main', 'mangas', 'warehouse255']
            for (const storeId of stores) {
                try {
                    const storeProducts = await DataClient.getProducts(storeId)
                    allProducts.push(...storeProducts)
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

    const loadCustomers = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const customersList = await DataClient.getCustomers()
            setCustomers(customersList)
        } catch (error) {
            console.error('Error loading customers:', error)
        }
    }

    // Search functionality
    useEffect(() => {
        let filtered = products

        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.size && product.size.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        setFilteredProducts(filtered)
    }, [searchTerm, products])

    // Add to order
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
                total: quantity * product.price,
                storeId: product.storeId
            }
            setOrderItems([...orderItems, newItem])
        }
        setShowProductModal(false)
    }

    // Remove from order
    const removeFromOrder = (productId: string) => {
        setOrderItems(orderItems.filter(item => item.productId !== productId))
    }

    // Update quantity
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

    // Get total amount
    const getTotalAmount = () => {
        return orderItems.reduce((sum, item) => sum + item.total, 0)
    }

    // Confirm order
    const confirmOrder = () => {
        if (!customerName.trim()) {
            alert('Харилцагчийн нэр оруулна уу')
            return
        }

        if (orderItems.length === 0) {
            alert('Захиалгад бараа нэмнэ үү')
            return
        }

        const confirmed = window.confirm(
            `Та захиалга баталгаажуулахдаа итгэлтэй байна уу?\n\nХарилцагч: ${customerName}\nНийт дүн: ${getTotalAmount().toLocaleString()}₮\nБарааны тоо: ${orderItems.length}`
        )

        if (confirmed) {
            saveOrderAndRedirect()
        }
    }

    // Save and redirect
    const saveOrderAndRedirect = async () => {
        const success = await saveOrder()
        if (success) {
            router.push('/orders/history')
        }
    }

    // Save order
    const saveOrder = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')

            // Stock validation
            for (const item of orderItems) {
                const allProducts = await DataClient.getProducts(item.storeId || 'main')
                const product = allProducts.find(p => p.id === item.productId)

                if (!product) {
                    alert(`Бараа олдсонгүй: ${item.productName}`)
                    return false
                }

                if (product.quantity < item.quantity) {
                    alert(`Хангалтгүй бараа: ${item.productName}. Байгаа: ${product.quantity}, Захиалсан: ${item.quantity}`)
                    return false
                }
            }

            const order: Order = {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                customerName: customerName.trim(),
                items: orderItems,
                totalAmount: getTotalAmount(),
                date: new Date().toISOString(),
                storeId: 'main',
                status: 'completed',
                payment: {
                    totalPaid: 0,
                    remainingAmount: getTotalAmount(),
                    paymentStatus: 'unpaid',
                    payments: []
                }
            }

            // Save via API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: order.customerName,
                    items: order.items,
                    totalAmount: order.totalAmount,
                    storeId: order.storeId,
                    payment: order.payment
                })
            })

            if (!response.ok) {
                throw new Error('API захиалга хадгалахад алдаа гарлаа')
            }

            const savedOrder = await response.json()
            console.log('Захиалга амжилттай хадгалагдлаа:', savedOrder.id)

            // Update stock
            for (const item of orderItems) {
                try {
                    const storeId = item.storeId || 'main'
                    const allProducts = await DataClient.getProducts(storeId)
                    const product = allProducts.find(p => p.id === item.productId)

                    if (product) {
                        const newQuantity = product.quantity - item.quantity

                        const updateResponse = await fetch(`/api/products/${storeId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                productId: item.productId,
                                quantity: newQuantity,
                                lastUpdated: new Date().toISOString()
                            })
                        })

                        if (!updateResponse.ok) {
                            console.error(`Failed to update stock for product ${item.productName}`)
                        }
                    }
                } catch (error) {
                    console.error(`Error updating stock for ${item.productName}:`, error)
                }
            }

            alert('Захиалга амжилттай баталгаажлаа!')
            setCustomerName('')
            setOrderItems([])
            loadAllProducts()
            return true
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Захиалга хадгалахад алдаа гарлаа')
            return false
        }
    }

    // Print order
    const printOrder = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const orderHtml = `
            <html>
            <head>
                <title>Захиалга</title>
                <style>
                    body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                    .shop-name { font-weight: bold; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { text-align: left; padding: 2px 0; }
                    .total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; }
                    .date { text-align: center; font-size: 10px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="shop-name">Оюунгэрэл</div>
                    <div>Захиалгын баримт</div>
                </div>
                
                <div>Харилцагч: ${customerName}</div>
                <div>Огноо: ${new Date().toLocaleString('mn-MN')}</div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Бараа</th>
                            <th>Тоо</th>
                            <th>Үнэ</th>
                            <th>Дүн</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItems.map((item) => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price.toLocaleString()}₮</td>
                                <td>${item.total.toLocaleString()}₮</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total">
                            <td colspan="3">Нийт дүн:</td>
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
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <h1 className="text-lg text-gray-600 mt-2">Ачааллаж байна...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white p-3 shadow-sm border-b sticky top-0 z-40">
                <h1 className="text-lg font-bold text-center">� Захиалга</h1>
            </div>

            {/* Mobile First Design */}
            <div className="flex flex-col h-screen">
                {/* Search */}
                <div className="p-3 bg-white border-b lg:border-b-0">
                    <input
                        type="text"
                        placeholder="🔍 Бараа хайх..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-500 text-black"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col lg:flex-row">
                    {/* Products Grid - Mobile optimized */}
                    <div className="flex-1 p-2">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[60vh] lg:max-h-none overflow-y-auto">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg p-2 shadow-sm border">
                                    <div className="text-center space-y-1">
                                        <h3 className="font-medium text-xs text-gray-900 line-clamp-2 h-8">{product.name}</h3>
                                        <div className="text-green-600 font-bold text-sm">{product.price.toLocaleString()}₮</div>
                                        <div className="text-xs text-gray-500">Үлдэгдэл: {product.quantity}</div>
                                        <button
                                            onClick={() => addToOrder(product)}
                                            disabled={product.quantity === 0}
                                            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 text-white py-1 px-2 rounded text-xs font-medium transition-all transform active:scale-95"
                                        >
                                            {product.quantity === 0 ? '❌' : '➕'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Panel - Mobile optimized */}
                    <div className="lg:w-80 bg-white border-t lg:border-t-0 lg:border-l">
                        <div className="p-3 space-y-3">
                            {/* Customer */}
                            <select
                                value={selectedCustomer?.id || ''}
                                onChange={(e) => {
                                    const customerId = e.target.value
                                    if (customerId) {
                                        const customer = customers.find(c => c.id === customerId)
                                        setSelectedCustomer(customer || null)
                                        setCustomerName(customer?.name || '')
                                    } else {
                                        setSelectedCustomer(null)
                                        setCustomerName('')
                                    }
                                }}
                                className="w-full px-3 py-2 border rounded-lg text-sm text-black"
                            >
                                <option value="">👤 Харилцагч сонгох</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.phone}
                                    </option>
                                ))}
                            </select>

                            {/* Custom customer input */}
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Эсвэл харилцагчийн нэр бичих"
                                className="w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-500 text-black"
                            />

                            {/* Order Items */}
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                <h3 className="font-medium text-sm">🛒 Захиалгын жагсаалт ({orderItems.length})</h3>
                                {orderItems.length === 0 ? (
                                    <p className="text-gray-500 text-xs text-center py-4">Захиалга хоосон байна</p>
                                ) : (
                                    orderItems.map((item) => (
                                        <div key={item.productId} className="bg-gray-50 rounded-lg p-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-xs text-gray-900 flex-1 pr-1">{item.productName}</h4>
                                                <button
                                                    onClick={() => removeFromOrder(item.productId)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs text-black font-medium w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className="text-green-600 font-bold text-xs">{item.total.toLocaleString()}₮</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Total */}
                            {orderItems.length > 0 && (
                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm">💰 Нийт дүн:</span>
                                        <span className="font-bold text-lg text-green-600">{getTotalAmount().toLocaleString()}₮</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={confirmOrder}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
                                        >
                                            ✅ Захиалга баталгаажуулах
                                        </button>
                                        <button
                                            onClick={printOrder}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium"
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
        </div>
    )
}