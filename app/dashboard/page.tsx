'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, Order } from '@/lib/types'

// Дэлгүүрийн мэдээлэл
const stores = [
    { id: 'main', name: 'Үндсэн дэлгүүр', color: 'bg-gradient-to-r from-green-500 to-green-600', icon: '🏬' },
    { id: 'mangas', name: 'Мангас агуулах', color: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: '📦' },
    { id: 'warehouse255', name: '255 агуулах', color: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: '📦' }
]

interface TotalStats {
    totalProducts: number
    dailyRevenue: number
}

interface LowStockItem {
    name: string
    quantity: number
    minStock: number
    storeId: string
}

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [totalStats, setTotalStats] = useState<TotalStats>({ totalProducts: 0, dailyRevenue: 0 })
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
    const router = useRouter()

    useEffect(() => {
        // Нэвтрэх статусыг шалгах
        const loggedIn = localStorage.getItem('isLoggedIn')
        const user = localStorage.getItem('username')

        if (loggedIn === 'true' && user) {
            setIsLoggedIn(true)
            setUsername(user)

            // Demo data нэмэх
            const isDemoAdded = localStorage.getItem('demoProductsAdded')
            if (!isDemoAdded) {
                import('@/lib/demo-data').then(({ addDemoProducts }) => {
                    addDemoProducts()
                    localStorage.setItem('demoProductsAdded', 'true')
                })
            }

            loadTotalStats()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadTotalStats = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')

            let totalProductTypes = 0  // Барааны төрлийн тоо
            const lowStock: LowStockItem[] = []

            // Бүх дэлгүүрийн мэдээлэл ачаалах
            for (const store of stores) {
                try {
                    const products = await DataClient.getProducts(store.id)
                    totalProductTypes += products.length  // Нийт барааны төрлийн тоо

                    // Low stock шалгах
                    products.forEach((product: Product) => {
                        const minStock = product.minStock || 5 // Default минималь stock
                        if (product.quantity <= minStock) {
                            lowStock.push({
                                name: product.name,
                                quantity: product.quantity,
                                minStock: minStock,
                                storeId: store.id
                            })
                        }
                    })
                } catch (error) {
                    console.error(`Error loading data for store ${store.id}:`, error)
                }
            }

            // Өнөөдрийн захиалгын орлого тооцох
            let dailyRevenue = 0
            try {
                const existingOrders = localStorage.getItem('orders')
                const orders = existingOrders ? JSON.parse(existingOrders) : []
                
                const today = new Date()
                const todayStr = today.toDateString()
                
                dailyRevenue = orders
                    .filter((order: Order) => {
                        const orderDate = new Date(order.date)
                        return orderDate.toDateString() === todayStr && order.status === 'completed'
                    })
                    .reduce((sum: number, order: Order) => sum + order.totalAmount, 0)
            } catch (error) {
                console.error('Error calculating daily revenue:', error)
            }

            setTotalStats({ totalProducts: totalProductTypes, dailyRevenue })
            setLowStockItems(lowStock)
        } catch (error) {
            console.error('Error loading total stats:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        router.push('/login')
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
            {/* Mobile App Header */}
            <header className="bg-white shadow-lg">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🏪</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Оюунгэрэл</h1>
                                <p className="text-xs text-gray-500">Сайн байна уу, </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-6">
                {/* Total Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-blue-500">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{totalStats.totalProducts}</div>
                            <div className="text-xs text-gray-500">📦 Барааны төрөл</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{totalStats.dailyRevenue.toLocaleString()}₮</div>
                            <div className="text-xs text-gray-500">Өнөөдрийн орлого</div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Warning */}
                {lowStockItems.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <span className="text-red-500">⚠️</span>
                            <h3 className="text-sm font-semibold text-red-800">Бага үлдсэн бараа</h3>
                        </div>
                        <div className="space-y-2">
                            {lowStockItems.slice(0, 3).map((item, index) => (
                                <div key={index} className="bg-white rounded-lg p-2 flex justify-between items-center">
                                    <span className="text-xs text-gray-700">{item.name}</span>
                                    <span className="text-xs font-medium text-red-600">
                                        {item.quantity}/{item.minStock}
                                    </span>
                                </div>
                            ))}
                            {lowStockItems.length > 3 && (
                                <div className="text-xs text-red-600 text-center">
                                    +{lowStockItems.length - 3} бусад бараа
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stores Grid */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 px-2">🏪 Дэлгүүрүүд</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {stores.map((store) => (
                            <Link key={store.id} href={`/store/${store.id}`}>
                                <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                                    <div className={`${store.color} p-6 rounded-2xl`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-3xl">{store.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{store.name}</h3>
                                                </div>
                                            </div>
                                            <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 px-2">⚡ Хурдан хандалт</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/order">
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">🛒</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Захиалга</h3>
                                    <p className="text-xs text-gray-500">Шинэ захиалга үүсгэх</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/orders/history">
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">�</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Захиалгын түүх</h3>
                                    <p className="text-xs text-gray-500">Өмнөх захиалгууд</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/customers">
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">👥</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Харилцагчид</h3>
                                    <p className="text-xs text-gray-500">Бүртгэл & түүх</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/reports">
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] p-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">📊</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Тайлан</h3>
                                    <p className="text-xs text-gray-500">Статистик & орлого</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Bottom Spacing for mobile */}
                <div className="h-6"></div>
            </main>
        </div>
    )
}