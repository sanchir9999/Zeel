'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Customer, Purchase } from '@/lib/types'

export default function CustomersPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: ''
    })

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        if (loggedIn === 'true') {
            setIsLoggedIn(true)
            loadCustomers()
            loadPurchases()
        } else {
            router.push('/login')
        }
    }, [router])

    const loadCustomers = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const customers = await DataClient.getCustomers()
            setCustomers(customers)
        } catch (error) {
            console.error('Error loading customers:', error)
            setCustomers([])
        }
    }

    const loadPurchases = async () => {
        try {
            const { DataClient } = await import('@/lib/api-client')
            const purchases = await DataClient.getPurchases()
            setPurchases(purchases)
        } catch (error) {
            console.error('Error loading purchases:', error)
            setPurchases([])
        }
    }

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newCustomer.name && newCustomer.phone) {
            try {
                const { DataClient } = await import('@/lib/api-client')
                await DataClient.addCustomer({
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    joinDate: new Date().toLocaleDateString('mn-MN'),
                    totalPurchases: 0
                })

                setNewCustomer({ name: '', phone: '' })
                setShowAddForm(false)
                await loadCustomers()
            } catch (error) {
                console.error('Error adding customer:', error)
                alert('Хэрэглэгч нэмэхэд алдаа гарлаа')
            }
        }
    }

    const handleDeleteCustomer = async (customerId: string) => {
        if (confirm('Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) {
            try {
                const { DataClient } = await import('@/lib/api-client')
                await DataClient.deleteCustomer(customerId)
                await loadCustomers()
                setSelectedCustomer(null)
            } catch (error) {
                console.error('Error deleting customer:', error)
                alert('Хэрэглэгч устгахад алдаа гарлаа')
            }
        }
    }

    const getCustomerPurchases = (customerId: string) => {
        return purchases.filter(p => p.customerId === customerId)
    }

    if (!isLoggedIn) {
        return <div className="min-h-screen flex items-center justify-center">Ачааллаж байна...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                            Хэрэглэгчдийн удирдлага
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                {showAddForm ? 'Хаах' : '+ Хэрэглэгч нэмэх'}
                            </button>
                            <Link
                                href="/dashboard"
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-center"
                            >
                                ← Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Нийт хэрэглэгч</h3>
                            <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Нийт худалдаа</h3>
                            <p className="text-2xl font-bold text-green-600">{purchases.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700">Нийт орлого</h3>
                            <p className="text-2xl font-bold text-purple-600">
                                {purchases.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}₮
                            </p>
                        </div>
                    </div>

                    {/* Add Customer Form */}
                    {showAddForm && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h3 className="text-lg font-semibold mb-4">Шинэ хэрэглэгч нэмэх</h3>
                            <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Нэр"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Утасны дугаар"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Нэмэх
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customers List */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Хэрэглэгчдийн жагсаалт</h2>
                        </div>

                        {customers.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-500 mb-4">Одоогоор хэрэглэгч байхгүй байна</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Эхний хэрэглэгчийг нэмэх
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {customers.map((customer) => {
                                    const customerPurchases = getCustomerPurchases(customer.id)
                                    const totalSpent = customerPurchases.reduce((sum, p) => sum + p.totalAmount, 0)

                                    return (
                                        <div
                                            key={customer.id}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                }`}
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                                                    <p className="text-sm text-gray-600">{customer.phone}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Элссэн: {customer.joinDate}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-green-600">
                                                        {customerPurchases.length} худалдаа
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {totalSpent.toLocaleString()}₮
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {selectedCustomer ? 'Хэрэглэгчийн дэлгэрэнгүй' : 'Хэрэглэгч сонгоно уу'}
                            </h2>
                        </div>

                        {selectedCustomer ? (
                            <div className="p-6">
                                {/* Customer Info */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h3>
                                            <p className="text-gray-600">{selectedCustomer.phone}</p>
                                            <p className="text-sm text-gray-500">
                                                Элссэн: {selectedCustomer.joinDate}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Устгах
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">Нийт худалдаа</p>
                                            <p className="font-semibold">{getCustomerPurchases(selectedCustomer.id).length}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">Нийт зарцуулсан</p>
                                            <p className="font-semibold">
                                                {getCustomerPurchases(selectedCustomer.id).reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}₮
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchase History */}
                                <div>
                                    <h4 className="text-md font-semibold mb-3">Худалдааны түүх</h4>
                                    {getCustomerPurchases(selectedCustomer.id).length === 0 ? (
                                        <p className="text-gray-500 text-sm">Одоогоор худалдаа байхгүй</p>
                                    ) : (
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {getCustomerPurchases(selectedCustomer.id).map((purchase) => (
                                                <div key={purchase.id} className="border rounded p-3 bg-gray-50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">{purchase.productName}</p>
                                                            <p className="text-sm text-gray-600">{purchase.storeName}</p>
                                                        </div>
                                                        <p className="font-semibold text-green-600">
                                                            {purchase.totalAmount.toLocaleString()}₮
                                                        </p>
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex justify-between">
                                                        <span>Тоо: {purchase.quantity}</span>
                                                        <span>{purchase.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                Хэрэглэгчийн мэдээллийг харахын тулд жагсаалтаас сонгоно уу
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}