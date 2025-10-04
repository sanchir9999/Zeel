'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/lib/types'

// Дэлгүүрийн мэдээлэл
const stores = [
    { id: 'mangas', name: 'Мангас агуулах', color: 'bg-blue-500' },
    { id: 'main', name: 'Үндсэн дэлгүүр', color: 'bg-green-500' },
    { id: 'warehouse255', name: '255 агуулах', color: 'bg-purple-500' }
]

interface StoreStats {
    totalProducts: number
    totalValue: number
}

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('')
    const [storeData, setStoreData] = useState<Record<string, StoreStats>>({})
    const router = useRouter()

    useEffect(() => {
        // Нэвтрэх статусыг шалгах
        const loggedIn = localStorage.getItem('isLoggedIn')
        const user = localStorage.getItem('username')

        if (loggedIn === 'true' && user) {
            setIsLoggedIn(true)
            setUsername(user)
            loadStoreData()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadStoreData = async () => {
        try {
            // Import DataClient dynamically to avoid SSR issues
            const { DataClient } = await import('@/lib/api-client')

            const data: Record<string, StoreStats> = {}

            // Load data for each store using API/localStorage hybrid approach
            for (const store of stores) {
                try {
                    const products = await DataClient.getProducts(store.id)
                    data[store.id] = {
                        totalProducts: products.length,
                        totalValue: products.reduce((sum: number, product: Product) => sum + (product.quantity * product.price), 0)
                    }
                } catch (error) {
                    console.error(`Error loading data for store ${store.id}:`, error)
                    // Fallback to empty data
                    data[store.id] = {
                        totalProducts: 0,
                        totalValue: 0
                    }
                }
            }

            setStoreData(data)
        } catch (error) {
            console.error('Error loading store data:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        router.push('/login')
    }

    if (!isLoggedIn) {
        return <div className="min-h-screen flex items-center justify-center">Ачааллаж байна...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Дэлгүүрийн Касын Систем</h1>
                            <p className="text-gray-600 text-sm sm:text-base">Тавтай морилно уу, {username}!</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Гарах
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                {/* Navigation Cards */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {stores.map((store) => (
                            <Link key={store.id} href={`/store/${store.id}`}>
                                <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200">
                                    <div className={`${store.color} px-4 py-4 sm:px-6 sm:py-5`}>
                                        <h3 className="text-base sm:text-lg leading-6 font-medium text-white text-center sm:text-left">{store.name}</h3>
                                    </div>
                                    <div className="px-4 py-4 sm:px-6 sm:py-5">
                                        <dl className="grid grid-cols-2 gap-4">
                                            <div className="text-center sm:text-left">
                                                <dt className="text-xs sm:text-sm font-medium text-gray-500">Барааны тоо</dt>
                                                <dd className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">{storeData[store.id]?.totalProducts || 0}</dd>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <dt className="text-xs sm:text-sm font-medium text-gray-500">Нийт үнийн дүн</dt>
                                                <dd className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">{(storeData[store.id]?.totalValue || 0).toLocaleString()}₮</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <Link href="/customers">
                            <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="px-4 py-5 sm:px-6 text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start mb-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 text-lg">👥</span>
                                        </div>
                                        <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900 hidden sm:block">Харилцагчид</h3>
                                    </div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2 sm:hidden">Харилцагчид</h3>
                                    <p className="text-sm text-gray-500">Харилцагчдын мэдээлэл болон худалдан авалтын түүх</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/reports">
                            <div className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="px-4 py-5 sm:px-6 text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start mb-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 text-lg">📊</span>
                                        </div>
                                        <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900 hidden sm:block">Тайлан</h3>
                                    </div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2 sm:hidden">Тайлан</h3>
                                    <p className="text-sm text-gray-500">Борлуулалтын тайлан болон статистик</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 border-t">
                <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-xs text-gray-500">
                        Store Management System v2.0 - Updated {new Date().toLocaleDateString('mn-MN')}
                    </p>
                </div>
            </footer>
        </div>
    )
}