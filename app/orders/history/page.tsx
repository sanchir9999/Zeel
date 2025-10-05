'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Order, PaymentRecord } from '@/lib/types'

export default function OrderHistoryPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [paymentAmount, setPaymentAmount] = useState('')
    const router = useRouter()

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadOrders()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadOrders = async () => {
        try {
            // Redis API-аас захиалгуудыг ачаалах
            const response = await fetch('/api/orders')

            if (response.ok) {
                const ordersList = await response.json()
                // Огноогоор эрэмбэлэх (шинээс хуучин руу)
                const sortedOrders = ordersList.sort((a: Order, b: Order) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                setOrders(sortedOrders)
                setFilteredOrders(sortedOrders)
                console.log('Захиалгын түүх Redis-аас ачаалагдлаа:', ordersList.length)
            } else {
                console.error('Failed to load orders from Redis API')
                setOrders([])
                setFilteredOrders([])
            }
        } catch (error) {
            console.error('Error loading orders from Redis:', error)
            setOrders([])
            setFilteredOrders([])
        }
    }

    // Хайлт
    useEffect(() => {
        let filtered = orders

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items.some(item =>
                    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        }

        setFilteredOrders(filtered)
    }, [searchTerm, orders])

    // Огноо форматлах
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('mn-MN'),
            time: date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
        }
    }

    // Захиалга устгах
    const deleteOrder = async (orderId: string, customerName: string) => {
        // Баталгаажуулах сануулга
        const isConfirmed = window.confirm(
            `Та "${customerName}"-ийн захиалгыг устгахдаа итгэлтэй байна уу?\n\nЗахиалгын дугаар: #${orderId.slice(-8)}\n\nЭнэ үйлдлийг буцаах боломжгүй!`
        )

        if (!isConfirmed) return

        try {
            const response = await fetch('/api/orders', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            })

            if (response.ok) {
                // Захиалгыг жагсаалтаас устгах
                const updatedOrders = orders.filter(order => order.id !== orderId)
                setOrders(updatedOrders)
                setFilteredOrders(updatedOrders.filter(order => {
                    if (!searchTerm) return true
                    return order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.items.some(item =>
                            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                }))
                alert('Захиалга амжилттай устгагдлаа!')
            } else {
                console.error('Failed to delete order')
                alert('Захиалга устгахад алдаа гарлаа!')
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            alert('Захиалга устгахад алдаа гарлаа!')
        }
    }

    // Төлбөрийн функцууд
    const openPaymentModal = (order: Order) => {
        setSelectedOrder(order)
        setPaymentAmount('')
        setShowPaymentModal(true)
    }

    const closePaymentModal = () => {
        setShowPaymentModal(false)
        setSelectedOrder(null)
        setPaymentAmount('')
    }

    const addPayment = async () => {
        if (!selectedOrder || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            alert('Зөв дүн оруулна уу!')
            return
        }

        const amount = parseFloat(paymentAmount)
        const currentPaid = selectedOrder.payment?.totalPaid || 0
        const remainingAmount = selectedOrder.totalAmount - currentPaid

        if (amount > remainingAmount) {
            alert('Төлөх дүн үлдэгдэл дүнгээс их байж болохгүй!')
            return
        }

        try {
            // Шинэ төлбөрийн бичлэг үүсгэх
            const newPayment = {
                id: Date.now().toString(),
                amount: amount,
                date: new Date().toISOString(),
                method: 'cash' as const,
                note: `Хэсэг төлбөр - ${amount.toLocaleString()}₮`
            }

            const newTotalPaid = currentPaid + amount
            const newPaymentStatus: 'paid' | 'partial' | 'unpaid' = newTotalPaid >= selectedOrder.totalAmount ? 'paid' : 
                                   newTotalPaid > 0 ? 'partial' : 'unpaid'

            // Захиалгын төлбөрийн мэдээллийг шинэчлэх
            const updatedOrder = {
                ...selectedOrder,
                payment: {
                    totalPaid: newTotalPaid,
                    remainingAmount: selectedOrder.totalAmount - newTotalPaid,
                    paymentStatus: newPaymentStatus,
                    payments: [...(selectedOrder.payment?.payments || []), newPayment]
                }
            }

            // API дуудаж захиалгыг шинэчлэх
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedOrder),
            })

            if (response.ok) {
                // Local state шинэчлэх
                const updatedOrders = orders.map(order => 
                    order.id === selectedOrder.id ? updatedOrder : order
                )
                setOrders(updatedOrders)
                setFilteredOrders(updatedOrders.filter(order => {
                    if (!searchTerm) return true
                    return order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.items.some(item =>
                            item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                }))
                
                alert(`Төлбөр амжилттай нэмэгдлээ! Төлсөн дүн: ${amount.toLocaleString()}₮`)
                closePaymentModal()
            } else {
                alert('Төлбөр нэмэхэд алдаа гарлаа!')
            }
        } catch (error) {
            console.error('Error adding payment:', error)
            alert('Төлбөр нэмэхэд алдаа гарлаа!')
        }
    }

    // Захиалга хэвлэх (жижиг баримт хэвлэгчд зориулсан)
    const printOrder = (order: Order) => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const { date, time } = formatDate(order.date)
        const orderHtml = `
            <html>
            <head>
                <title>Захиалга #${order.id.slice(-8)}</title>
                <style>
                    @media print {
                        @page { 
                            size: 58mm auto; 
                            margin: 0; 
                        }
                    }
                    body { 
                        font-family: 'Courier New', monospace;
                        font-size: 9px;
                        line-height: 1.2;
                        margin: 0;
                        padding: 2mm;
                        width: 54mm;
                        color: #000;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 3px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 2px;
                    }
                    .shop-name {
                        font-weight: bold;
                        font-size: 10px;
                    }
                    .order-info { 
                        margin: 3px 0;
                        font-size: 8px;
                    }
                    .items {
                        margin: 3px 0;
                    }
                    .item {
                        margin: 1px 0;
                        font-size: 8px;
                    }
                    .item-name {
                        font-weight: bold;
                    }
                    .item-details {
                        display: flex;
                        justify-content: space-between;
                    }
                    .total-section {
                        border-top: 1px dashed #000;
                        margin-top: 3px;
                        padding-top: 2px;
                    }
                    .total {
                        font-weight: bold;
                        font-size: 10px;
                        text-align: center;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 3px;
                        font-size: 7px;
                        border-top: 1px dashed #000;
                        padding-top: 2px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="shop-name">Оюунгэрэл</div>
                    <div>Захиалгын баримт</div>
                </div>
                
                <div class="order-info">
                    <div>Харилцагч: ${order.customerName}</div>
                    <div>Огноо: ${date} ${time}</div>
                    <div>Дугаар: #${order.id.slice(-8)}</div>
                </div>

                <div class="items">
                    ${order.items.map((item, index) => `
                        <div class="item">
                            <div class="item-name">${item.productName}</div>
                            <div class="item-details">
                                <span>${item.quantity} x ${item.price.toLocaleString()}₮</span>
                                <span>${item.total.toLocaleString()}₮</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="total-section">
                    <div class="total">
                        НИЙТ ДҮН: ${order.totalAmount.toLocaleString()}₮
                    </div>
                </div>

                <div class="footer">
                    <div>Баярлалаа!</div>
                    <div>Танд баярлалаа</div>
                </div>
            </body>
            </html>
        `

        printWindow.document.write(orderHtml)
        printWindow.document.close()

        // Хэвлэх диалог автоматаар нээх
        printWindow.onload = () => {
            printWindow.print()
            printWindow.close()
        }
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
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Захиалгын түүх</h1>
                        <div className="text-sm text-gray-500">
                            Нийт захиалга: {orders.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Хайлтын талбар */}
                <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                    <input
                        type="text"
                        placeholder="Захиалга хайх (харилцагчийн нэр, захиалгын дугаар, барааны нэр...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black text-black"
                    />
                </div>

                {/* Захиалгын жагсаалт - Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full bg-white rounded-xl p-8 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Захиалга олдсонгүй</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Захиалгын түүх хоосон байна'}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const { date, time } = formatDate(order.date)
                            return (
                                <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                                    {/* Захиалгын header */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{order.customerName}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                order.payment?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                order.payment?.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {order.payment?.paymentStatus === 'paid' ? 'Төлөгдсөн' :
                                                    order.payment?.paymentStatus === 'partial' ? 'Үлдэгдэлтэй' : 'Төлөгдөөгүй'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">#{order.id.slice(-8)}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-xs text-gray-500">
                                                <div>{date}</div>
                                                <div>{time}</div>
                                            </div>
                                            <div className="text-lg font-bold text-green-600">
                                                {order.totalAmount.toLocaleString()}₮
                                            </div>
                                        </div>
                                    </div>

                                    {/* Төлбөрийн мэдээлэл */}
                                    <div className="border-t pt-3 mb-3">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Төлбөрийн мэдээлэл:</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                                <span className="text-gray-600">Нийт дүн:</span>
                                                <span className="font-medium text-gray-900">{order.totalAmount.toLocaleString()}₮</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                                <span className="text-gray-600">Төлсөн дүн:</span>
                                                <span className="font-medium text-green-600">
                                                    {(order.payment?.totalPaid || 0).toLocaleString()}₮
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                                <span className="text-gray-600">Үлдэгдэл:</span>
                                                <span className={`font-medium ${(order.payment?.remainingAmount || order.totalAmount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {(order.payment?.remainingAmount || order.totalAmount).toLocaleString()}₮
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                                <span className="text-gray-600">Төлөв:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.payment?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                    order.payment?.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.payment?.paymentStatus === 'paid' ? 'Төлөгдсөн' :
                                                     order.payment?.paymentStatus === 'partial' ? 'Үлдэгдэлтэй' : 'Төлөгдөөгүй'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Товчнууд - гурван товч */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => deleteOrder(order.id, order.customerName)}
                                            className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform flex items-center justify-center space-x-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Устгах</span>
                                        </button>
                                        <button
                                            onClick={() => printOrder(order)}
                                            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform flex items-center justify-center space-x-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            <span>Хэвлэх</span>
                                        </button>
                                        <button
                                            onClick={() => openPaymentModal(order)}
                                            className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform flex items-center justify-center space-x-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            <span>Төлбөр</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Төлбөрийн Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-black">Төлбөрийн мэдээлэл</h3>
                            <button
                                onClick={closePaymentModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Захиалгын мэдээлэл */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-black">
                                <div className="font-medium">Харилцагч: {selectedOrder.customerName}</div>
                                <div>Захиалгын дугаар: #{selectedOrder.id.slice(-8)}</div>
                                <div className="mt-2 font-bold text-lg">Нийт дүн: {selectedOrder.totalAmount.toLocaleString()}₮</div>
                            </div>
                        </div>

                        {/* Төлбөрийн статус */}
                        <div className="mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-sm text-black">Төлсөн дүн</div>
                                    <div className="text-lg font-bold text-green-600">
                                        {(selectedOrder.payment?.totalPaid || 0).toLocaleString()}₮
                                    </div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <div className="text-sm text-black">Үлдэгдэл</div>
                                    <div className="text-lg font-bold text-red-600">
                                        {(selectedOrder.payment?.remainingAmount || selectedOrder.totalAmount).toLocaleString()}₮
                                    </div>
                                </div>
                            </div>

                            {/* Төлбөрийн статус badge */}
                            <div className="mt-4 text-center">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    selectedOrder.payment?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    selectedOrder.payment?.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {selectedOrder.payment?.paymentStatus === 'paid' ? 'Төлөгдсөн' :
                                     selectedOrder.payment?.paymentStatus === 'partial' ? 'Хэсэгчлэн төлөгдсөн' :
                                     'Төлөгдөөгүй'}
                                </span>
                            </div>
                        </div>

                        {/* Төлбөр нэмэх хэсэг */}
                        {(selectedOrder.payment?.remainingAmount || selectedOrder.totalAmount) > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Төлбөр нэмэх
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Дүн оруулах..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                        max={selectedOrder.payment?.remainingAmount || selectedOrder.totalAmount}
                                    />
                                    <button
                                        onClick={addPayment}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Нэмэх
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Хамгийн их: {(selectedOrder.payment?.remainingAmount || selectedOrder.totalAmount).toLocaleString()}₮
                                </div>
                            </div>
                        )}

                        {/* Төлбөрийн түүх */}
                        {selectedOrder.payment?.payments && selectedOrder.payment.payments.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-black mb-2">Төлбөрийн түүх</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedOrder.payment.payments.map((payment) => {
                                        const paymentDate = new Date(payment.date)
                                        return (
                                            <div key={payment.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                                <div>
                                                    <div className="text-sm font-medium text-black">{payment.amount.toLocaleString()}₮</div>
                                                    <div className="text-xs text-gray-500">
                                                        {paymentDate.toLocaleDateString('mn-MN')} {paymentDate.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {payment.method === 'cash' ? 'Бэлэн' : 
                                                     payment.method === 'card' ? 'Карт' : 'Шилжүүлэг'}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Хаах товч */}
                        <div className="flex justify-end">
                            <button
                                onClick={closePaymentModal}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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