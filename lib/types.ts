// Type definitions for our store management system
export interface Product {
    id: string
    name: string
    quantity: number
    price: number
    addedDate: string
}

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    joinDate: string
    totalPurchases: number
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