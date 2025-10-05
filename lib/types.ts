// Type definitions for our store management system
export interface Product {
    id: string
    name: string
    category: string // жишээ: "Ундаа", "Хоол", "Цэвэрлэх хэрэгсэл"
    brand?: string // жишээ: "Coca Cola", "Pepsi"
    size?: string // жишээ: "0.5л", "1.5л", "2л"
    variant?: string // жишээ: "Улаан", "Цэнхэр", "Жижиг", "Том"
    barcode?: string // штрих код
    quantity: number
    price: number
    costPrice?: number // өртөг
    addedDate: string
    storeId: string
}

export interface Category {
    id: string
    name: string
    description?: string
}

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    joinDate: string
    totalPurchases: number
}

// Захиалгын мэдээлэл
export interface OrderItem {
    productId: string
    productName: string
    quantity: number
    price: number
    total: number
}

export interface Order {
    id: string
    customerId?: string
    customerName: string
    items: OrderItem[]
    totalAmount: number
    date: string
    storeId: string
    status: 'pending' | 'completed' | 'cancelled'
}

export interface Purchase {
    id: string
    customerId: string
    customerName: string
    productName: string
    storeId: string
    storeName: string
    quantity: number
    price: number
    totalAmount: number
    date: string
}