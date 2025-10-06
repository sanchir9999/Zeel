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
    const [newProduct, setNewProduct] = useState({
        name: '',
        quantity: undefined as number | undefined,
        price: undefined as number | undefined,
        category: 'general',
        unitType: 'piece' as 'piece' | 'box',
        piecesPerBox: undefined as number | undefined,
        boxQuantity: undefined as number | undefined,
        boxPrice: undefined as number | undefined
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
                    unitType: newProduct.unitType,
                    piecesPerBox: newProduct.unitType === 'box' ? newProduct.piecesPerBox : undefined,
                    boxQuantity: newProduct.unitType === 'box' ? newProduct.boxQuantity : undefined,
                    boxPrice: newProduct.unitType === 'box' ? newProduct.boxPrice : undefined,
                })

                // Reload products to get updated list
                await loadProducts()

                setNewProduct({
                    name: '',
                    quantity: undefined,
                    price: undefined,
                    category: 'general',
                    unitType: 'piece',
                    piecesPerBox: undefined,
                    boxQuantity: undefined,
                    boxPrice: undefined
                })
                setShowAddForm(false)
            } catch (error) {
                console.error('Error adding product:', error)
                alert('Бараа нэмэхэд алдаа гарлаа')
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
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="text-red-600 hover:text-red-900 text-sm bg-red-50 px-2 py-1 rounded"
                                        >
                                            Устгах
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-black font-medium">Тоо ширхэг:</span>
                                            <div className="mt-1">
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center text-base text-black"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-black font-medium">Ширхэгийн үнэ:</span>
                                            <div className="mt-1 font-medium text-black">{product.price.toLocaleString()}₮</div>
                                        </div>
                                    </div>

                                    {product.unitType === 'box' && (
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3 p-2 bg-blue-50 rounded">
                                            <div>
                                                <span className="text-black font-medium">Хайрцаг:</span>
                                                <div className="mt-1 font-medium">
                                                    {product.boxQuantity || 0} хайрцаг
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-black font-medium">Хайрцагийн үнэ:</span>
                                                <div className="mt-1 font-medium">{(product.boxPrice || 0).toLocaleString()}₮</div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-black font-medium">1 хайрцагт:</span>
                                                <span className="ml-1 font-medium">{product.piecesPerBox || 1} ширхэг</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                        <div>
                                            <span className="text-black font-medium">Нийт үнэ:</span>
                                            <div className="mt-1 font-semibold text-green-600">
                                                {(product.quantity * product.price).toLocaleString()}₮
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-black font-medium">Нэмсэн огноо:</span>
                                            <div className="mt-1 text-black font-medium">{product.addedDate}</div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Барааны нэр
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Тоо ширхэг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Хайрцаг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Нэгжийн үнэ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Нийт үнэ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Нэмсэн огноо
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Үйлдэл
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            <input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-black"
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            {product.unitType === 'box' ? (
                                                <div className="space-y-1">
                                                    <div className="text-blue-600 font-medium">
                                                        {product.boxQuantity || 0} хайрцаг
                                                    </div>
                                                    <div className="text-xs text-black">
                                                        {product.piecesPerBox || 1} ширхэг/хайрцаг
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-black">Ширхэгээр</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            <div className="space-y-1">
                                                <div>{product.price.toLocaleString()}₮/ширхэг</div>
                                                {product.unitType === 'box' && (
                                                    <div className="text-xs text-blue-600">
                                                        {(product.boxPrice || 0).toLocaleString()}₮/хайрцаг
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                                            {(product.quantity * product.price).toLocaleString()}₮
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            {product.addedDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                <h3 className="text-lg font-medium text-gray-900 mb-6 text-center sm:text-left">Шинэ бараа нэмэх</h3>
                                <form onSubmit={handleAddProduct} className="space-y-4">
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
                                            Тоо ширхэг
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newProduct.quantity || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Тоо ширхэг оруулна уу"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Борлуулах нэгж
                                        </label>
                                        <select
                                            value={newProduct.unitType}
                                            onChange={(e) => setNewProduct({ ...newProduct, unitType: e.target.value as 'piece' | 'box' })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                        >
                                            <option value="piece">Ширхэгээр</option>
                                            <option value="box">Хайрцгаар</option>
                                        </select>
                                    </div>

                                    {newProduct.unitType === 'box' && (
                                        <>
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
                                                    Хайрцагийн үнэ (₮)
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={newProduct.boxPrice || ''}
                                                    onChange={(e) => {
                                                        const boxPrice = parseInt(e.target.value) || 0
                                                        const piecesPerBox = newProduct.piecesPerBox || 1
                                                        const piecePrice = piecesPerBox > 0 ? Math.round(boxPrice / piecesPerBox) : 0
                                                        setNewProduct({
                                                            ...newProduct,
                                                            boxPrice: boxPrice,
                                                            price: piecePrice
                                                        })
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                                    placeholder="Хайрцагийн үнэ оруулна уу"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ангилал
                                        </label>
                                        <select
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                        >
                                            <option value="general">Ерөнхий</option>
                                            <option value="drinks">Ундаа</option>
                                            <option value="food">Хоол</option>
                                            <option value="dairy">Сүүн бүтээгдэхүүн</option>
                                            <option value="personal">Хувийн хэрэгцээ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {newProduct.unitType === 'box' ? 'Ширхэгийн үнэ (автомат тооцох)' : 'Ширхэгийн үнэ'} (₮)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newProduct.price || ''}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-black"
                                            placeholder="Ширхэгийн үнэ оруулна уу"
                                            disabled={newProduct.unitType === 'box'}
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
        </div>
    )
}