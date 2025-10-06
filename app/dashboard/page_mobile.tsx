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

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [totalStats, setTotalStats] = useState<TotalStats>({ totalProducts: 0, dailyRevenue: 0 })
    const router = useRouter()

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        const user = localStorage.getItem('username')

        if (loggedIn === 'true' && user) {
            setIsLoggedIn(true)
            setUsername(user)

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

            let totalProductTypes = 0

            for (const store of stores) {
                try {
                    const products = await DataClient.getProducts(store.id)
                    totalProductTypes += products.length
                } catch (error) {
                    console.error(`Error loading data for store ${store.id}:`, error)
                }
            }

            let dailyRevenue = 0
            try {
                const today = new Date().toISOString().split('T')[0]
                const response = await fetch(`/api/orders/revenue?date=${today}`)

                if (response.ok) {
                    const data = await response.json()
                    dailyRevenue = data.revenue || 0
                    console.log('Өнөөдрийн орлого Redis-аас ачаалагдлаа:', dailyRevenue)
                } else {
                    console.error('Failed to load daily revenue from Redis API')
                }
            } catch (error) {
                console.error('Error fetching daily revenue from Redis:', error)
            }

            setTotalStats({ totalProducts: totalProductTypes, dailyRevenue })
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
            {/* Compact Mobile Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-3 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">🏪</span>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">Оюунгэрэл</h1>
                                <p className="text-xs text-gray-500">POS систем</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Compact Main Content */}
            <main className="p-3 space-y-4">
                {/* Stats Cards - Smaller */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/products">
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all transform active:scale-95">
                            <div className="text-center">
                                <div className="text-xl font-bold text-blue-600">{totalStats.totalProducts}</div>
                                <div className="text-xs text-black">📦 Бараа</div>
                            </div>
                        </div>
                    </Link>
                    <Link href="/order">
                        <div className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all transform active:scale-95">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{totalStats.dailyRevenue.toLocaleString()}₮</div>
                                <div className="text-xs text-black">💰 Орлого</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Stores - Compact */}
                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-gray-800">🏪 Дэлгүүрүүд</h2>
                    <div className="grid grid-cols-1 gap-2">
                        {stores.map((store) => (
                            <Link key={store.id} href={`/store/${store.id}`}>
                                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95">
                                    <div className={`${store.color} p-3 rounded-lg`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl">{store.icon}</span>
                                                <h3 className="text-sm font-semibold text-white">{store.name}</h3>
                                            </div>
                                            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions - Smaller Grid */}
                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-gray-800">⚡ Хурдан цэс</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/order">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 p-3">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-lg">🛒</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm">Захиалга</h3>
                                    <p className="text-xs text-gray-500">Шинэ захиалга</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/orders/history">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 p-3">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-lg">📋</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm">Түүх</h3>
                                    <p className="text-xs text-gray-500">Захиалгын түүх</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/customers">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 p-3">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-lg">👥</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm">Харилцагч</h3>
                                    <p className="text-xs text-gray-500">Бүртгэл</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/reports">
                            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all transform active:scale-95 p-3">
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-lg">📊</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm">Тайлан</h3>
                                    <p className="text-xs text-gray-500">Статистик</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-4"></div>
            </main>
        </div>
    )
}