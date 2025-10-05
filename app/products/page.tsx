'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/lib/types'

// Дэлгүүрийн мэдээлэл
const stores = [
    { id: 'main', name: 'Үндсэн дэлгүүр' },
    { id: 'mangas', name: 'Мангас агуулах' },
    { id: 'warehouse255', name: '255 агуулах' }
]

export default function ProductsPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [allProducts, setAllProducts] = useState<(Product & { storeName: string })[]>([])
    const [filteredProducts, setFilteredProducts] = useState<(Product & { storeName: string })[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStore, setSelectedStore] = useState('all')
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadAllProducts()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadAllProducts = async () => {
        setLoading(true)
        try {
            const { DataClient } = await import('@/lib/api-client')
            let products: (Product & { storeName: string })[] = []

            // Бүх дэлгүүрээс бараа ачаалах
            for (const store of stores) {
                try {
                    const storeProducts = await DataClient.getProducts(store.id)
                    const productsWithStore = storeProducts.map(product => ({
                        ...product,
                        storeName: store.name
                    }))
                    products = [...products, ...productsWithStore]
                } catch (error) {
                    console.error(`Error loading products from ${store.name}:`, error)
                }
            }

            setAllProducts(products)
            setFilteredProducts(products)
        } catch (error) {
            console.error('Error loading all products:', error)
        } finally {
            setLoading(false)
        }
    }

    // Хайлт болон шүүлт
    useEffect(() => {
        let filtered = allProducts

        // Дэлгүүрээр шүүх
        if (selectedStore !== 'all') {
            const storeName = stores.find(s => s.id === selectedStore)?.name
            filtered = filtered.filter(product => product.storeName === storeName)
        }

        // Хайлтаар шүүх
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.storeName.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredProducts(filtered)
    }, [searchTerm, selectedStore, allProducts])

    const getTotalValue = () => {
        return filteredProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0)
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
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                ← Буцах
                            </Link>
                            <h1 className="text-2xl font-bold text-black">Нийт барааны жагсаалт</h1>
                        </div>
                        <div className="text-sm text-black">
                            Нийт бараа: {filteredProducts.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Хайлт болон шүүлт */}
                <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Хайлтын талбар */}
                        <input
                            type="text"
                            placeholder="Барааны нэр, ангилал хайх..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-black text-black"
                        />
                        
                        {/* Дэлгүүрээр шүүх */}
                        <select
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        >
                            <option value="all">Бүх дэлгүүр</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Статистик */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-black">Нийт бараа</h3>
                        <p className="text-2xl font-bold text-blue-600">{filteredProducts.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-black">Нийт үлдэгдэл</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {filteredProducts.reduce((sum, p) => sum + p.quantity, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-black">Нийт үнийн дүн</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {getTotalValue().toLocaleString()}₮
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-black">Бараа ачаалж байна...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-black mb-2">Бараа олдсонгүй</h3>
                        <p className="text-black">
                            {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Барааны жагсаалт хоосон байна'}
                        </p>
                    </div>
                ) : (
                    /* Барааны жагсаалт - Grid layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={`${product.storeId}-${product.id}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                                <div className="space-y-3">
                                    {/* Барааны нэр болон дэлгүүр */}
                                    <div>
                                        <h3 className="font-semibold text-black text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-blue-600 font-medium">{product.storeName}</p>
                                        {product.category && (
                                            <p className="text-xs text-black">{product.category}</p>
                                        )}
                                    </div>

                                    {/* Үнэ болон үлдэгдэл */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-black">Үнэ:</span>
                                            <span className="font-bold text-green-600 text-sm">{product.price.toLocaleString()}₮</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-black">Үлдэгдэл:</span>
                                            <span className={`font-medium text-sm ${product.quantity === 0 ? 'text-red-500' : 
                                                product.quantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                {product.quantity}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-black">Нийт үнэ:</span>
                                            <span className="font-bold text-purple-600 text-sm">
                                                {(product.price * product.quantity).toLocaleString()}₮
                                            </span>
                                        </div>
                                    </div>

                                    {/* Дэлгүүр руу очих товч */}
                                    <Link href={`/store/${product.storeId}`}>
                                        <button className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 transform">
                                            Дэлгүүр харах
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}