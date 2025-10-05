'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Order, OrderItem, Customer } from '@/lib/types'

export default function OrderPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [showProductModal, setShowProductModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paidAmount, setPaidAmount] = useState(0)
    const [payments, setPayments] = useState<{ amount: number, date: string }[]>([])

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

    const loadCustomers = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const customersList = await DataClient.getCustomers()
            setCustomers(customersList)
        } catch (error) {
            console.error('Error loading customers:', error)
        }
    }

    // Хайлт
    useEffect(() => {
        let filtered = products

        // Текст хайлт
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.size && product.size.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }

        setFilteredProducts(filtered)
    }, [searchTerm, products])

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
                total: quantity * product.price,
                storeId: product.storeId
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

    // Захиалга баталгаажуулах
    const confirmOrder = () => {
        if (!customerName.trim()) {
            alert('Харилцагчийн нэр оруулна уу')
            return
        }

        if (orderItems.length === 0) {
            alert('Захиалгад бараа нэмнэ үү')
            return
        }

        // Confirmation dialog
        const confirmed = window.confirm(
            `Та захиалга баталгаажуулахдаа итгэлтэй байна уу?\n\nХарилцагч: ${customerName}\nНийт дүн: ${getTotalAmount().toLocaleString()}₮\nБарааны тоо: ${orderItems.length}`
        )

        if (confirmed) {
            saveOrderAndRedirect()
        }
    }

    // Захиалга хадгалаад захиалгын түүх хуудас руу шилжих
    const saveOrderAndRedirect = async () => {
        const success = await saveOrder()
        if (success) {
            // Захиалгын түүх хуудас руу шилжих
            router.push('/orders/history')
        }
    }

    // Захиалга хадгалах
    const saveOrder = async () => {
        try {
            // Stock validation - Бараа хангалттай байгаа эсэхийг шалгах
            const { DataClient } = await import('@/lib/api-client')

            for (const item of orderItems) {
                // Тухайн бараанаас хангалттай quantity байгаа эсэхийг шалгах
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
                storeId: 'main', // Үндсэн дэлгүүр
                status: 'completed',
                payment: {
                    totalPaid: 0,
                    remainingAmount: getTotalAmount(),
                    paymentStatus: 'unpaid',
                    payments: []
                }
            }

            // API-ээр дамжуулан захиалга хадгалах (Redis database-д хадгалагдана)
            try {
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
                console.log('Захиалга Redis-д амжилттай хадгалагдлаа:', savedOrder.id)

            } catch (apiError) {
                console.error('API алдаа:', apiError)
                alert('Захиалга хадгалахад алдаа гарлаа. Дахин оролдоно уу.')
                return false
            }

            // Stock-аас автоматаар хасах
            for (const item of orderItems) {
                const storeId = item.storeId || 'main'
                const allProducts = await DataClient.getProducts(storeId)
                const productIndex = allProducts.findIndex(p => p.id === item.productId)

                if (productIndex !== -1) {
                    allProducts[productIndex].quantity -= item.quantity
                    allProducts[productIndex].lastUpdated = new Date().toISOString()
                    localStorage.setItem(`products_${storeId}`, JSON.stringify(allProducts))
                }
            }

            // Захиалга амжилттай хадгалагдсан
            alert('Захиалга амжилттай баталгаажлаа! Барааны тоо ширхэг шинэчлэгдлээ.')
            setCustomerName('')
            setOrderItems([])
            // Products-ийг дахин ачаалах
            loadAllProducts()
            return true
        } catch (error) {
            console.error('Error saving order:', error)
            alert('Захиалга хадгалахад алдаа гарлаа')
            return false
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

    // Төлбөрийн функцууд
    const openPaymentModal = () => {
        setShowPaymentModal(true)
    }

    const addPayment = () => {
        const amount = parseFloat(paymentAmount)
        if (isNaN(amount) || amount <= 0) {
            alert('Зөв дүн оруулна уу')
            return
        }

        const totalAmount = getTotalAmount()
        const remainingAmount = totalAmount - paidAmount

        if (amount > remainingAmount) {
            alert(`Үлдэгдэл төлбөр: ${remainingAmount.toLocaleString()}₮`)
            return
        }

        const newPayment = {
            amount: amount,
            date: new Date().toLocaleString('mn-MN')
        }

        setPayments([...payments, newPayment])
        setPaidAmount(paidAmount + amount)
        setPaymentAmount('')
    }

    const getRemainingAmount = () => {
        return getTotalAmount() - paidAmount
    }

    const resetPayments = () => {
        setPayments([])
        setPaidAmount(0)
        setShowPaymentModal(false)
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
            <div className="flex flex-col lg:flex-row h-screen">
                {/* Барааны жагсаалт - зүүн талд */}
                <div className="lg:w-2/3 p-4">
                    {/* Хайлтын талбар */}
                    <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                        <input
                            type="text"
                            placeholder="Бараа хайх (нэр, брэнд, хэмжээ...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black text-black"
                        />
                    </div>

                    {/* Барааны grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                        <span className="text-green-600 font-bold text-sm">{product.price.toLocaleString()}₮</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-black">Үлдэгдэл: {product.quantity}</span>
                                        <button
                                            onClick={() => addToOrder(product)}
                                            disabled={product.quantity === 0}
                                            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 text-white py-1 px-3 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform disabled:transform-none disabled:scale-100"
                                        >
                                            {product.quantity === 0 ? 'Дууссан' : 'Нэмэх'}
                                        </button>
                                    </div>
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        >
                            <option value="">Харилцагч сонгох</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.phone}
                                </option>
                            ))}
                        </select>

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
                                                className="text-red-500 hover:text-red-700 active:text-red-800 transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 transform p-1 rounded-full hover:bg-red-50 active:bg-red-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="flex justif.3y-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded text-xs font-bold transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 active:shadow-inner transform"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm text-black font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded text-xs font-bold transition-all duration-150 ease-in-out hover:scale-110 active:scale-95 active:shadow-inner transform"
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
                                    <span className="text-lg font-semibold text-black">Нийт дүн:</span>
                                    <span className="text-xl font-bold text-green-600">{getTotalAmount().toLocaleString()}₮</span>
                                </div>

                                {/* Товчууд */}
                                <div className="space-y-2">
                                    <button
                                        onClick={confirmOrder}
                                        className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform"
                                    >
                                        Захиалга баталгаажуулах
                                    </button>
                                    <button
                                        onClick={printOrder}
                                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform"
                                    >
                                        🖨️ Хэвлэх
                                    </button>
                                    <button
                                        onClick={openPaymentModal}
                                        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform"
                                    >
                                        💰 Төлбөр
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Төлбөрийн Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">💰 Төлбөрийн мэдээлэл</h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Нийт төлөх дүн */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <div className="text-center">
                                <p className="text-sm text-black mb-1">Нийт төлөх дүн</p>
                                <p className="text-2xl font-bold text-blue-600">{getTotalAmount().toLocaleString()}₮</p>
                            </div>
                        </div>

                        {/* Төлөгдсөн дүн болон үлдэгдэл */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-black mb-1">Төлөгдсөн</p>
                                <p className="text-lg font-bold text-green-600">{paidAmount.toLocaleString()}₮</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <p className="text-sm text-black mb-1">Үлдэгдэл</p>
                                <p className="text-lg font-bold text-red-600">{getRemainingAmount().toLocaleString()}₮</p>
                            </div>
                        </div>

                        {/* Төлбөр нэмэх */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-black mb-2">Төлөх дүн</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Дүн оруулах..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                                />
                                <button
                                    onClick={addPayment}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Нэмэх
                                </button>
                            </div>
                        </div>

                        {/* Төлбөрийн түүх */}
                        {payments.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-black mb-2">Төлбөрийн түүх</h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {payments.map((payment, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-black">{payment.date}</span>
                                            <span className="text-sm font-medium text-green-600">{payment.amount.toLocaleString()}₮</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Товчууд */}
                        <div className="flex space-x-2">
                            <button
                                onClick={resetPayments}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Цэвэрлэх
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                            >
                                Хаах
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}