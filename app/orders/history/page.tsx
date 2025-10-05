'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
            // API-аас захиалгуудыг ачаалах (device хооронд sync хийгдэнэ)
            const response = await fetch('/api/orders')
            let ordersList = []

            if (response.ok) {
                ordersList = await response.json()
                console.log('Orders loaded successfully from API')
            } else {
                throw new Error('Failed to load from API')
            }
            
            // Огноогоор эрэмбэлэх (шинээс хуучин руу)
            const sortedOrders = ordersList.sort((a: Order, b: Order) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            setOrders(sortedOrders)
            setFilteredOrders(sortedOrders)
        } catch (error) {
            console.warn('API failed, falling back to localStorage:', error)
            // Fallback: localStorage-аас ачаалах
            try {
                const existingOrders = localStorage.getItem('orders')
                const ordersList = existingOrders ? JSON.parse(existingOrders) : []
                const sortedOrders = ordersList.sort((a: Order, b: Order) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                setOrders(sortedOrders)
                setFilteredOrders(sortedOrders)
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError)
            }
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
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Буцах</span>
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Захиалгын түүх</h1>
                        </div>
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

                {/* Захиалгын жагсаалт */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center">
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
                                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Захиалгын header */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {order.status === 'completed' ? 'Дууссан' :
                                                        order.status === 'pending' ? 'Хүлээгдэж буй' : 'Цуцлагдсан'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">Захиалгын дугаар: {order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">{date}</div>
                                            <div className="text-sm text-gray-500">{time}</div>
                                            <div className="text-xl font-bold text-green-600 mt-1">
                                                {order.totalAmount.toLocaleString()}₮
                                            </div>
                                        </div>
                                    </div>

                                    {/* Барааны жагсаалт */}
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Захиалагдсан бараа:</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <span className="text-sm font-medium text-gray-900">{item.productName}</span>
                                                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-black font-medium">{item.price.toLocaleString()}₮</div>
                                                        <div className="text-sm font-bold text-green-600">{item.total.toLocaleString()}₮</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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