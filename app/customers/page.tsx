'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Customer, Purchase, Order } from '@/lib/types'

export default function CustomersPage() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [orders, setOrders] = useState<Order[]>([])
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
            loadOrders()
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

    const loadOrders = async () => {
        try {
            const response = await fetch('/api/orders')
            if (response.ok) {
                const ordersList = await response.json()
                setOrders(ordersList)
            } else {
                console.error('Failed to load orders from API')
                setOrders([])
            }
        } catch (error) {
            console.error('Error loading orders:', error)
            setOrders([])
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

    const getCustomerOrders = (customerName: string) => {
        return orders.filter(order => order.customerName === customerName)
    }

    if (!isLoggedIn) {
        return <div className="min-h-screen flex items-center justify-center">Ачааллаж байна...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header - Simple */}
                <div className="mb-4">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 transform text-sm"
                        >
                            {showAddForm ? 'Хаах' : '+ Хэрэглэгч нэмэх'}
                        </button>
                    </div>

                    {/* Add Customer Form - Compact */}
                    {showAddForm && (
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                            <h3 className="text-base font-semibold mb-3 text-black">Шинэ хэрэглэгч нэмэх</h3>
                            <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                    type="text"
                                    placeholder="Нэр"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black text-black text-sm"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Утасны дугаар"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-black text-black text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 transform text-sm"
                                >
                                    Нэмэх
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 transform text-sm"
                                >
                                    Цуцлах
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Main Content - Full Width Grid */}
                <div className="space-y-6">
                    {/* Customer List - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {customers.length === 0 ? (
                            <div className="col-span-full bg-white rounded-xl p-8 text-center">
                                <p className="text-black mb-4">Одоогоор хэрэглэгч байхгүй</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 transform text-sm"
                                >
                                    Эхний хэрэглэгчийг нэмэх
                                </button>
                            </div>
                        ) : (
                            customers.map((customer) => {
                                const customerOrders = getCustomerOrders(customer.name)
                                const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0)

                                return (
                                    <div
                                        key={customer.id}
                                        className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 ${selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                            }`}
                                        onClick={() => setSelectedCustomer(customer)}
                                    >
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-black truncate">{customer.name}</h3>
                                            <p className="text-sm text-black truncate">{customer.phone}</p>
                                            <p className="text-xs text-black">
                                                {customer.joinDate}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm">
                                                <div className="font-medium text-green-600">
                                                    {customerOrders.length} захиалга
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-black">
                                                    {totalSpent.toLocaleString()}₮
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Customer Details - Compact */}
                    {selectedCustomer && (
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold text-black">
                                    Дэлгэрэнгүй мэдээлэл
                                </h2>
                            </div>

                            <div className="p-4">
                                {/* Customer Info - Compact */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-base font-semibold text-black">{selectedCustomer.name}</h3>
                                            <p className="text-sm text-black">{selectedCustomer.phone}</p>
                                            <p className="text-xs text-black">
                                                {selectedCustomer.joinDate}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            Устгах
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-2 rounded text-center">
                                            <p className="text-xs text-black">Захиалга</p>
                                            <p className="font-semibold text-sm">{getCustomerOrders(selectedCustomer.name).length}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded text-center">
                                            <p className="text-xs text-black">Зарцуулсан</p>
                                            <p className="font-semibold text-sm">
                                                {getCustomerOrders(selectedCustomer.name).reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}₮
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order History - Compact */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 text-black">Захиалгын хуудас</h4>
                                    {getCustomerOrders(selectedCustomer.name).length === 0 ? (
                                        <p className="text-black text-xs">Одоогоор захиалга байхгүй</p>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {getCustomerOrders(selectedCustomer.name).map((order) => {
                                                const orderDate = new Date(order.date)
                                                const formattedDate = orderDate.toLocaleDateString('mn-MN')
                                                const formattedTime = orderDate.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

                                                return (
                                                    <div key={order.id} className="border rounded p-2 bg-gray-50">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <p className="font-medium text-xs">#{order.id.slice(-8)}</p>
                                                                <p className="text-xs text-black">{order.items.length} бараа</p>
                                                            </div>
                                                            <p className="font-semibold text-green-600 text-xs">
                                                                {order.totalAmount.toLocaleString()}₮
                                                            </p>
                                                        </div>
                                                        <div className="text-xs text-black flex justify-between">
                                                            <span>{formattedDate} {formattedTime}</span>
                                                            <span className={`px-1 py-0.5 rounded text-xs ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {order.status === 'completed' ? 'Дууссан' :
                                                                    order.status === 'pending' ? 'Хүлээгдэж буй' : 'Цуцлагдсан'}
                                                            </span>
                                                        </div>
                                                        {/* Барааны жагсаалт */}
                                                        <div className="mt-1 pt-1 border-t">
                                                            <div className="space-y-0.5">
                                                                {order.items.slice(0, 3).map((item, index) => (
                                                                    <div key={index} className="flex justify-between text-xs">
                                                                        <span className="truncate">{item.productName} ×{item.quantity}</span>
                                                                        <span>{item.total.toLocaleString()}₮</span>
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 3 && (
                                                                    <div className="text-xs text-black">... +{order.items.length - 3} бараа</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}