'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product, Purchase } from '@/lib/types'

const storeNames: { [key: string]: string } = {
    mangas: 'Мангас агуулах',
    main: 'Үндсэн дэлгүүр',
    warehouse255: '255 агуулах'
}

interface StoreReport {
    name: string
    totalProducts: number
    totalStock: number
    totalValue: number
    totalSales: number
    totalRevenue: number
}

interface ReportData {
    stores: Record<string, StoreReport>
    totalCustomers: number
    totalPurchases: number
    totalRevenue: number
}

export default function ReportsPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [reportData, setReportData] = useState<ReportData>({
        stores: {},
        totalCustomers: 0,
        totalPurchases: 0,
        totalRevenue: 0
    })

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            generateReport()
        } else {
            router.push('/login')
        }
    }, [router])

    const generateReport = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')

            const stores = ['mangas', 'main', 'warehouse255']
            const customers = await DataClient.getCustomers()
            const purchases = await DataClient.getPurchases()

            const data: ReportData = {
                stores: {},
                totalCustomers: customers.length,
                totalPurchases: purchases.length,
                totalRevenue: purchases.reduce((sum: number, p: Purchase) => sum + p.totalAmount, 0)
            }

            for (const storeId of stores) {
                try {
                    const products = await DataClient.getProducts(storeId)
                    const storePurchases = purchases.filter((p: Purchase) => p.storeId === storeId)

                    data.stores[storeId] = {
                        name: storeNames[storeId],
                        totalProducts: products.length,
                        totalStock: products.reduce((sum: number, p: Product) => sum + p.quantity, 0),
                        totalValue: products.reduce((sum: number, p: Product) => sum + (p.quantity * p.price), 0),
                        totalSales: storePurchases.length,
                        totalRevenue: storePurchases.reduce((sum: number, p: Purchase) => sum + p.totalAmount, 0)
                    }
                } catch (error) {
                    console.error(`Error loading data for store ${storeId}:`, error)
                    data.stores[storeId] = {
                        name: storeNames[storeId],
                        totalProducts: 0,
                        totalStock: 0,
                        totalValue: 0,
                        totalSales: 0,
                        totalRevenue: 0
                    }
                }
            }

            setReportData(data)
        } catch (error) {
            console.error('Error generating report:', error)
        }
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
                        <div>
                            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm inline-block mb-2">
                                ← Dashboard-руу буцах
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Тайлан ба Статистик</h1>
                        </div>
                        <button
                            onClick={generateReport}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Тайлан шинэчлэх
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">👥</span>
                                    </div>
                                </div>
                                <div className="ml-3 sm:ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Нийт харилцагч</dt>
                                        <dd className="text-sm sm:text-lg font-medium text-gray-900">{reportData.totalCustomers}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">🛒</span>
                                    </div>
                                </div>
                                <div className="ml-3 sm:ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Нийт худалдан авалт</dt>
                                        <dd className="text-sm sm:text-lg font-medium text-gray-900">{reportData.totalPurchases}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">₮</span>
                                    </div>
                                </div>
                                <div className="ml-3 sm:ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Нийт орлого</dt>
                                        <dd className="text-sm sm:text-lg font-medium text-gray-900">{reportData.totalRevenue?.toLocaleString()}₮</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">🏪</span>
                                    </div>
                                </div>
                                <div className="ml-3 sm:ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Дэлгүүрийн тоо</dt>
                                        <dd className="text-sm sm:text-lg font-medium text-gray-900">3</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {Object.entries(reportData.stores || {}).map(([storeId, store]: [string, StoreReport]) => (
                        <div key={storeId} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{store.name}</h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Барааны төрөл</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{store.totalProducts}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Нийт тоо ширхэг</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{store.totalStock}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Бараанй үнийн дүн</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{store.totalValue?.toLocaleString()}₮</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Борлуулалт</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{store.totalSales} удаа</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Борлуулалтын орлого</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-semibold text-green-600">
                                            {store.totalRevenue?.toLocaleString()}₮
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-4">
                                    <Link
                                        href={`/store/${storeId}`}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Дэлгэрэнгүй харах →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Хурдан үйлдлүүд</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/customers">
                                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h4 className="font-medium text-gray-900">Харилцагчид</h4>
                                    <p className="text-sm text-gray-500 mt-1">Харилцагчдын мэдээлэл харах</p>
                                </div>
                            </Link>

                            <Link href="/dashboard">
                                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <h4 className="font-medium text-gray-900">Дэлгүүрүүд</h4>
                                    <p className="text-sm text-gray-500 mt-1">Дэлгүүрийн удирдлага</p>
                                </div>
                            </Link>

                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h4 className="font-medium text-gray-900">Экспорт</h4>
                                <p className="text-sm text-gray-500 mt-1">Тайланг файл болгон татаж авах</p>
                                <button
                                    onClick={() => alert('Энэ функц удахгүй нэмэгдэнэ')}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                                >
                                    CSV татах
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Системийн мэдээлэл</h4>
                    <p className="text-sm text-blue-700">
                        Бүх мэдээлэл таны компьютерийн localStorage-д хадгалагддаг.
                        Мэдээллээ алдахгүйн тулд тогтмол backup хийх хэрэгтэй.
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                        Сүүлийн шинэчлэл: {new Date().toLocaleString('mn-MN')}
                    </div>
                </div>
            </div>
        </div>
    )
}