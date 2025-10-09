'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/lib/types'

// Дэлгүүрийн мэдээлэл
const storeInfo: { [key: string]: { name: string; color: string } } = {
    mangas: { name: 'Мангас агуулах', color: 'bg-blue-500' },
    main: { name: 'Үндсэн дэлгүүр', color: 'bg-green-500' },
    warehouse255: { name: '255 агуулах', color: 'bg-purple-500' }
}

export default function StorePage() {
    const params = useParams()
    const router = useRouter()
    const storeId = params.storeId as string

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [newProduct, setNewProduct] = useState({
        name: '',
        quantity: undefined as number | undefined,
        price: undefined as number | undefined,
        category: 'ready-food',
        piecesPerBox: undefined as number | undefined,
        boxQuantity: undefined as number | undefined,
        boxPrice: undefined as number | undefined,
        expiryDate: '' as string
    })
    const [editProduct, setEditProduct] = useState({
        name: '',
        quantity: undefined as number | undefined,
        price: undefined as number | undefined,
        category: 'ready-food',
        piecesPerBox: undefined as number | undefined,
        boxQuantity: undefined as number | undefined,
        boxPrice: undefined as number | undefined,
        expiryDate: '' as string
    })

    const currentStore = storeInfo[storeId]

    const loadProducts = useCallback(async () => {
        try {
            // Import DataClient dynamically
            const { DataClient } = await import('../../../lib/api-client')
            const products = await DataClient.getProducts(storeId)
            setProducts(products)
        } catch (error) {
            console.error('Error loading products:', error)
            setProducts([])
        }
    }, [storeId])

    useEffect(() => {
        // Нэвтрэх статусыг шалгах
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadProducts()
        } else {
            router.push('/login')
        }
    }, [storeId, router, loadProducts])

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newProduct.name &&
            newProduct.quantity !== undefined && newProduct.quantity > 0 &&
            newProduct.price !== undefined && newProduct.price > 0) {
            try {
                const { DataClient } = await import('../../../lib/api-client')
                await DataClient.addProduct(storeId, {
                    name: newProduct.name,
                    quantity: newProduct.quantity,
                    price: newProduct.price,
                    addedDate: new Date().toLocaleDateString('mn-MN'),
                    category: newProduct.category,
                    storeId,
                    // Хайрцагийн мэдээлэл
                    unitType: 'box',
                    piecesPerBox: newProduct.piecesPerBox,
                    boxQuantity: newProduct.boxQuantity,
                    boxPrice: newProduct.boxPrice,
                    expiryDate: newProduct.expiryDate,
                })

                // Reload products to get updated list
                await loadProducts()

                setNewProduct({
                    name: '',
                    quantity: undefined,
                    price: undefined,
                    category: 'ready-food',
                    piecesPerBox: undefined,
                    boxQuantity: undefined,
                    boxPrice: undefined,
                    expiryDate: ''
                })
                setShowAddForm(false)
            } catch (error) {
                console.error('Error adding product:', error)
                alert('Бараа нэмэхэд алдаа гарлаа')
            }
        }
    }

    const handleEditProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingProduct && editProduct.name &&
            editProduct.quantity !== undefined && editProduct.quantity > 0 &&
            editProduct.price !== undefined && editProduct.price > 0) {
            try {
                const { DataClient } = await import('../../../lib/api-client')
                await DataClient.updateProduct(storeId, editingProduct.id, {
                    name: editProduct.name,
                    quantity: editProduct.quantity,
                    price: editProduct.price,
                    category: editProduct.category,
                    piecesPerBox: editProduct.piecesPerBox,
                    boxQuantity: editProduct.boxQuantity,
                    boxPrice: editProduct.boxPrice,
                    expiryDate: editProduct.expiryDate,
                    unitType: 'box'
                })

                await loadProducts()
                setShowEditForm(false)
                setEditingProduct(null)
            } catch (error) {
                console.error('Error updating product:', error)
                alert('Бараа засахад алдаа гарлаа')
            }
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        if (confirm('Энэ барааг устгахдаа итгэлтэй байна уу?')) {
            try {
                const { DataClient } = await import('@/lib/api-client')
                await DataClient.deleteProduct(storeId, productId)
                await loadProducts()
            } catch (error) {
                console.error('Error deleting product:', error)
                alert('Бараа устгахад алдаа гарлаа')
            }
        }
    }

    const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity >= 0) {
            try {
                const { DataClient } = await import('@/lib/api-client')
                await DataClient.updateProduct(storeId, productId, { quantity: newQuantity })
                await loadProducts()
            } catch (error) {
                console.error('Error updating product:', error)
                alert('Барааны тоо ширхэг шинэчлэхэд алдаа гарлаа')
            }
        }
    }

    const getCategoryName = (categoryValue: string) => {
        const categoryMap: { [key: string]: string } = {
            'ready-food': 'Бэлэн хоол',
            'goymon': 'Гоймон',
            'pichen': 'Пичень',
            'chocolate': 'Шоколад',
            'nabor': 'Набор',
            'rezinen-chikher': 'Резинен чихэр',
            'urlen-chikher': 'Үрлэн чихэр',
            'bokh': 'Бохь',
            'choco-paya': 'Чоко Пая',
            'box-pichen': 'Хайрцаг пичень',
            'ishtei-chikher': 'Иштэй чихэр',
            'tos': 'Тос',
            'salad-types': 'Салад төрөл',
            'varen': 'Варень',
            'kg-chikher': 'Кг чихэр',
            'kg-pichen': 'Кг пичень',
            'amtlagch': 'Амтлагч',
            'samryn-types': 'Самрын төрөл',
            'chibs': 'Чибс',
            'sea-buckthorn': 'Далайн байцаа',
            'drinks': 'Ундаа',
            'fish': 'Загас',
            'coffee-tea': 'Кофе цай',
            'tea-idea': 'Цай идээ',
            'yooton': 'Ёотон',
            'celcegnuur': 'Цэлцэгнүүр',
            'rulet': 'Рулет',
            'sok': 'Сок',
            'kompod': 'Компод',
            'salt': 'Давс',
            'small-goods': 'Жижиглэн бараа',
            'german-goods': 'Герман бараа'
        }
        return categoryMap[categoryValue] || categoryValue
    }

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product)
        setEditProduct({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            category: product.category,
            piecesPerBox: product.piecesPerBox,
            boxQuantity: product.boxQuantity,
            boxPrice: product.boxPrice,
            expiryDate: product.expiryDate || ''
        })
        setShowEditForm(true)
    }

    if (!isLoggedIn) {
        return <div className="min-h-screen flex items-center justify-center">Ачааллаж байна...</div>
    }

    if (!currentStore) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Дэлгүүр олдсонгүй</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Dashboard-руу буцах
                    </Link>
                </div>
            </div>
        )
    }

    const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.price), 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white p-3 shadow-sm border-b sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href="/dashboard"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            ←
                        </Link>
                        <h1 className="text-lg font-bold text-black">
                            {currentStore.name === 'Үндсэн дэлгүүр' && '🏬'}
                            {currentStore.name === 'Мангас агуулах' && '📦'}
                            {currentStore.name === '255 агуулах' && '📦'}
                            {' '}{currentStore.name}
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Нэмэх
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <header className="hidden lg:block bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                ← Dashboard-руу буцах
                            </Link>
                            <h1 className="text-2xl font-bold text-black">
                                {currentStore.name === 'Үндсэн дэлгүүр' && '🏬'}
                                {currentStore.name === 'Мангас агуулах' && '📦'}
                                {currentStore.name === '255 агуулах' && '📦'}
                                {' '}{currentStore.name}
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Бараа нэмэх
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="p-3 lg:p-8 space-y-4 lg:space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <div className="bg-white rounded-lg p-3 lg:p-5 shadow-sm">
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl mb-2">📦</div>
                            <div className="text-lg lg:text-xl font-bold text-blue-600">{products.length}</div>
                            <div className="text-xs lg:text-sm text-black">Нийт бараа</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 lg:p-5 shadow-sm">
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl mb-2">💰</div>
                            <div className="text-lg lg:text-xl font-bold text-green-600">{totalValue.toLocaleString()}₮</div>
                            <div className="text-xs lg:text-sm text-black">Нийт үнэ</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 lg:p-5 shadow-sm col-span-2 lg:col-span-1">
                        <div className="text-center">
                            <div className="text-2xl lg:text-3xl mb-2">📊</div>
                            <div className="text-lg lg:text-xl font-bold text-purple-600">
                                {products.reduce((sum, product) => sum + product.quantity, 0)}
                            </div>
                            <div className="text-xs lg:text-sm text-black">Нийт тоо</div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Барааны жагсаалт</h3>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block sm:hidden">
                        <div className="space-y-4 px-4 pb-4">
                            {products.map((product) => (
                                <div key={product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-medium text-black text-lg">{product.name}</h4>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                                            >
                                                Засах
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900 text-sm bg-red-50 px-2 py-1 rounded"
                                            >
                                                Устгах
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                            {getCategoryName(product.category)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-700 font-medium">Тоо ширхэг:</span>
                                            <div className="mt-1">
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center text-base text-gray-900 bg-white"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Ширхэгийн үнэ:</span>
                                            <div className="mt-1 font-medium text-gray-900">{product.price.toLocaleString()}₮</div>
                                        </div>
                                    </div>

                                    {product.unitType === 'box' && (
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3 p-2 bg-blue-50 rounded">
                                            <div>
                                                <span className="text-gray-700 font-medium">Хайрцаг:</span>
                                                <div className="mt-1 font-medium text-gray-900">
                                                    {product.boxQuantity || 0} хайрцаг
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-gray-700 font-medium">Хайрцагийн үнэ:</span>
                                                <div className="mt-1 font-medium text-gray-900">{(product.boxPrice || 0).toLocaleString()}₮</div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-700 font-medium">1 хайрцагт:</span>
                                                <span className="ml-1 font-medium text-gray-900">{product.piecesPerBox || 1} ширхэг</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                        <div>
                                            <span className="text-gray-700 font-medium">Нийт үнэ:</span>
                                            <div className="mt-1 font-semibold text-green-600">
                                                {(product.quantity * product.price).toLocaleString()}₮
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Нэмсэн огноо:</span>
                                            <div className="mt-1 text-gray-900 font-medium">{product.addedDate}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Дуусах хугацаа:</span>
                                            <div className="mt-1">
                                                {product.expiryDate ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${new Date(product.expiryDate) < new Date()
                                                        ? 'bg-red-100 text-red-800'
                                                        : new Date(product.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {product.expiryDate}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 font-medium">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Барааны нэр
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Тоо ширхэг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Хайрцаг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Нэгжийн үнэ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Нийт үнэ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Нэмсэн огноо
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Дуусах хугацаа
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Ангилал
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Үйлдэл
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-gray-900 bg-white"
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.unitType === 'box' ? (
                                                <div className="space-y-1">
                                                    <div className="text-blue-600 font-medium">
                                                        {product.boxQuantity || 0} хайрцаг
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {product.piecesPerBox || 1} ширхэг/хайрцаг
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-900">Ширхэгээр</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="space-y-1">
                                                <div className="text-gray-900">{product.price.toLocaleString()}₮/ширхэг</div>
                                                {product.unitType === 'box' && (
                                                    <div className="text-xs text-blue-600">
                                                        {(product.boxPrice || 0).toLocaleString()}₮/хайрцаг
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {(product.quantity * product.price).toLocaleString()}₮
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.addedDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.expiryDate ? (
                                                <span className={`px-2 py-1 rounded text-xs ${new Date(product.expiryDate) < new Date()
                                                    ? 'bg-red-100 text-red-800'
                                                    : new Date(product.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {product.expiryDate}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                {getCategoryName(product.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Засах
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Устгах
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Барааны мэдээлэл байхгүй байна</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Эхний барааг нэмэх
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md mx-auto bg-white shadow-lg rounded-lg">
                            <div className="p-6">
                                <form onSubmit={handleAddProduct} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ангилал
                                        </label>
                                        <select
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                        >
                                            <option value="ready-food">Бэлэн хоол</option>
                                            <option value="goymon">Гоймон</option>
                                            <option value="pichen">Пичень</option>
                                            <option value="chocolate">Шоколад</option>
                                            <option value="nabor">Набор</option>
                                            <option value="rezinen-chikher">Резинен чихэр</option>
                                            <option value="urlen-chikher">Үрлэн чихэр</option>
                                            <option value="bokh">Бохь</option>
                                            <option value="choco-paya">Чоко Пая</option>
                                            <option value="box-pichen">Хайрцаг пичень</option>
                                            <option value="ishtei-chikher">Иштэй чихэр</option>
                                            <option value="tos">Тос</option>
                                            <option value="salad-types">Салад төрөл</option>
                                            <option value="varen">Варень</option>
                                            <option value="kg-chikher">Кг чихэр</option>
                                            <option value="kg-pichen">Кг пичень</option>
                                            <option value="amtlagch">Амтлагч</option>
                                            <option value="samryn-types">Самрын төрөл</option>
                                            <option value="chibs">Чибс</option>
                                            <option value="sea-buckthorn">Далайн байцаа</option>
                                            <option value="drinks">Ундаа</option>
                                            <option value="fish">Загас</option>
                                            <option value="coffee-tea">Кофе цай</option>
                                            <option value="tea-idea">Цай идээ</option>
                                            <option value="yooton">Ёотон</option>
                                            <option value="celcegnuur">Цэлцэгнүүр</option>
                                            <option value="rulet">Рулет</option>
                                            <option value="sok">Сок</option>
                                            <option value="kompod">Компод</option>
                                            <option value="salt">Давс</option>
                                            <option value="small-goods">Жижиглэн бараа</option>
                                            <option value="german-goods">Герман бараа</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Барааны нэр
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-black"
                                            placeholder="Барааны нэрийг оруулна уу"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Хайрцагийн тоо
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newProduct.boxQuantity || ''}
                                            onChange={(e) => {
                                                const boxQty = parseInt(e.target.value) || 0
                                                const piecesPerBox = newProduct.piecesPerBox || 1
                                                const totalPieces = boxQty * piecesPerBox
                                                setNewProduct({
                                                    ...newProduct,
                                                    boxQuantity: boxQty,
                                                    quantity: totalPieces
                                                })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Хайрцагийн тоо оруулна уу"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Нэг хайрцагт хэдэн ширхэг
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newProduct.piecesPerBox || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, piecesPerBox: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Нэг хайрцагт хэдэн ширхэг"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Нэгжийн үнэ (₮)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newProduct.price || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Нэгжийн үнэ оруулна уу"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Дуусах хугацаа (сонголттой)
                                        </label>
                                        <input
                                            type="date"
                                            value={newProduct.expiryDate}
                                            onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Дуусах хугацаа"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                        <button
                                            type="submit"
                                            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base font-medium transition-colors"
                                        >
                                            Нэмэх
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="w-full sm:flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                                        >
                                            Цуцлах
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditForm && editingProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative w-full max-w-md mx-auto bg-white shadow-lg rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-6 text-center sm:text-left">Бараа засах</h3>
                                <form onSubmit={handleEditProductSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ангилал
                                        </label>
                                        <select
                                            value={editProduct.category}
                                            onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                        >
                                            <option value="ready-food">Бэлэн хоол</option>
                                            <option value="goymon">Гоймон</option>
                                            <option value="pichen">Пичень</option>
                                            <option value="chocolate">Шоколад</option>
                                            <option value="nabor">Набор</option>
                                            <option value="rezinen-chikher">Резинен чихэр</option>
                                            <option value="urlen-chikher">Үрлэн чихэр</option>
                                            <option value="bokh">Бохь</option>
                                            <option value="choco-paya">Чоко Пая</option>
                                            <option value="box-pichen">Хайрцаг пичень</option>
                                            <option value="ishtei-chikher">Иштэй чихэр</option>
                                            <option value="tos">Тос</option>
                                            <option value="salad-types">Салад төрөл</option>
                                            <option value="varen">Варень</option>
                                            <option value="kg-chikher">Кг чихэр</option>
                                            <option value="kg-pichen">Кг пичень</option>
                                            <option value="amtlagch">Амтлагч</option>
                                            <option value="samryn-types">Самрын төрөл</option>
                                            <option value="chibs">Чибс</option>
                                            <option value="sea-buckthorn">Далайн байцаа</option>
                                            <option value="drinks">Ундаа</option>
                                            <option value="fish">Загас</option>
                                            <option value="coffee-tea">Кофе цай</option>
                                            <option value="tea-idea">Цай идээ</option>
                                            <option value="yooton">Ёотон</option>
                                            <option value="celcegnuur">Цэлцэгнүүр</option>
                                            <option value="rulet">Рулет</option>
                                            <option value="sok">Сок</option>
                                            <option value="kompod">Компод</option>
                                            <option value="salt">Давс</option>
                                            <option value="small-goods">Жижиглэн бараа</option>
                                            <option value="german-goods">Герман бараа</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Барааны нэр
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editProduct.name}
                                            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black placeholder-black"
                                            placeholder="Барааны нэрийг оруулна уу"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Хайрцагийн тоо
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={editProduct.boxQuantity || ''}
                                            onChange={(e) => {
                                                const boxQty = parseInt(e.target.value) || 0
                                                const piecesPerBox = editProduct.piecesPerBox || 1
                                                const totalPieces = boxQty * piecesPerBox
                                                setEditProduct({
                                                    ...editProduct,
                                                    boxQuantity: boxQty,
                                                    quantity: totalPieces
                                                })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Хайрцагийн тоо оруулна уу"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Нэг хайрцагт хэдэн ширхэг
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={editProduct.piecesPerBox || ''}
                                            onChange={(e) => setEditProduct({ ...editProduct, piecesPerBox: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Нэг хайрцагт хэдэн ширхэг"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Нэгжийн үнэ (₮)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={editProduct.price || ''}
                                            onChange={(e) => setEditProduct({ ...editProduct, price: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Нэгжийн үнэ оруулна уу"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Дуусах хугацаа (сонголттой)
                                        </label>
                                        <input
                                            type="date"
                                            value={editProduct.expiryDate}
                                            onChange={(e) => setEditProduct({ ...editProduct, expiryDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Дуусах хугацаа"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                        <button
                                            type="submit"
                                            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-base font-medium transition-colors"
                                        >
                                            Хадгалах
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditForm(false)
                                                setEditingProduct(null)
                                            }}
                                            className="w-full sm:flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-3 rounded-lg text-base font-medium transition-colors"
                                        >
                                            Цуцлах
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}