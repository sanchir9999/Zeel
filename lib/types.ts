// Type definitions for our store management system
export interface Product {
    id: string
    name: string
    category: string // жишээ: "drinks", "food", "dairy", "personal", "cleaning"
    brand?: string // жишээ: "Coca Cola", "Pepsi"
    size?: string // жишээ: "0.5л", "1.5л", "2л"
    variant?: string // жишээ: "Улаан", "Цэнхэр", "Жижиг", "Том"
    barcode?: string // штрих код
    sku?: string // Stock Keeping Unit

    // Үндсэн quantity мэдээлэл
    quantity: number // Нийт ширхэг
    price: number // Ширхэгийн үнэ

    // Хайрцагийн мэдээлэл (сонголттой)
    unitType?: 'piece' | 'box' // 'piece' = ширхэгээр, 'box' = хайрцагаар
    piecesPerBox?: number // Нэг хайрцагт хэдэн ширхэг
    boxQuantity?: number // Хайрцагийн тоо
    boxPrice?: number // Хайрцагийн үнэ

    costPrice?: number // өртөг
    minStock?: number // доод хязгаар stock
    maxStock?: number // дээд хязгаар stock
    supplier?: string // нийлүүлэгч
    expiryDate?: string // дуусах хугацаа
    addedDate: string
    lastUpdated?: string // сүүлд шинэчилсэн огноо
    isActive?: boolean // идэвхтэй эсэх
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
    storeId?: string // Аль дэлгүүрээс авсан
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
    payment?: {
        totalPaid: number
        remainingAmount: number
        paymentStatus: 'paid' | 'partial' | 'unpaid'
        payments: PaymentRecord[]
    }
}

export interface PaymentRecord {
    id: string
    amount: number
    date: string
    method: 'cash' | 'card' | 'transfer'
    note?: string
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