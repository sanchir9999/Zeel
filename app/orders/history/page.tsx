'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Order } from '@/lib/types'

export default function OrderHistoryPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {order.status === 'completed' ? 'Дууссан' :
                                                    order.status === 'pending' ? 'Хүлээгдэж буй' : 'Цуцлагдсан'}
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

                                    {/* Барааны жагсаалт - жижигхэн */}
                                    <div className="border-t pt-3 mb-3">
                                        <h4 className="text-xs font-medium text-gray-700 mb-2">Бараа ({order.items.length}):</h4>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded text-xs">
                                                    <div className="flex-1 truncate">
                                                        <span className="font-medium text-gray-900">{item.productName}</span>
                                                        <span className="text-gray-500 ml-1">×{item.quantity}</span>
                                                    </div>
                                                    <div className="text-right ml-2">
                                                        <div className="font-medium text-green-600">{item.total.toLocaleString()}₮</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Товчнууд - нэг мөрөнд */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => deleteOrder(order.id, order.customerName)}
                                            className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform flex items-center justify-center space-x-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span>Устгах</span>
                                        </button>
                                        <button
                                            onClick={() => printOrder(order)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 active:shadow-lg transform flex items-center justify-center space-x-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            <span>Хэвлэх</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}