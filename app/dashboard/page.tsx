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

            // Бүх дэлгүүрийн мэдээлэл ачаалах
            for (const store of stores) {
                try {
                    const products = await DataClient.getProducts(store.id)
                    totalProductTypes += products.length  // Нийт барааны төрлийн тоо
                } catch (error) {
                    console.error(`Error loading data for store ${store.id}:`, error)
                }
            }

            // Өнөөдрийн захиалгын орлого тооцох (Redis API ашиглан)
            let dailyRevenue = 0
            try {
                const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <h1 className="text-xl text-gray-600 mt-4">Ачааллаж байна...</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white p-3 shadow-sm border-b sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-black">🏠 Dashboard</h1>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-black font-medium">👤 {username}</div>
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
            </div>

            {/* Desktop Header */}
            <header className="hidden lg:block bg-white shadow-sm border-b">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">🏪</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Оюунгэрэл</h1>
                                <p className="text-sm text-gray-500">POS систем</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Гарах
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-3 lg:p-8 space-y-4 lg:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-6">
                    <Link href="/products">
                        <div className="bg-white rounded-lg p-3 lg:p-6 shadow-sm border hover:shadow-md transition-all transform active:scale-95">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl mb-2">📦</div>
                                <div className="text-lg lg:text-2xl font-bold text-blue-600">{totalStats.totalProducts}</div>
                                <div className="text-xs lg:text-sm text-black">Бараа</div>
                            </div>
                        </div>
                    </Link>
                    <Link href="/order">
                        <div className="bg-white rounded-lg p-3 lg:p-6 shadow-sm border hover:shadow-md transition-all transform active:scale-95">
                            <div className="text-center">
                                <div className="text-2xl lg:text-3xl mb-2">💰</div>
                                <div className="text-lg lg:text-xl font-bold text-green-600">{totalStats.dailyRevenue.toLocaleString()}₮</div>
                                <div className="text-xs lg:text-sm text-black">Орлого</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Stores */}
                <div className="space-y-3 lg:space-y-4">
                    <h2 className="text-lg lg:text-xl font-bold text-black">🏪 Дэлгүүрүүд</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-4">
                        {stores.map((store) => (
                            <Link key={store.id} href={`/store/${store.id}`}>
                                <div className={`${store.color} p-6 lg:p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95`}>
                                    <div className="flex flex-col items-center text-center space-y-4 lg:space-y-6">
                                        <span className="text-5xl lg:text-6xl">{store.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-xl lg:text-2xl">{store.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}