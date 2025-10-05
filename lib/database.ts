import { kv } from '@vercel/kv'
import { v4 as uuidv4 } from 'uuid'
import { Product, Customer, Purchase } from './types'

// Check if KV is available (production environment)
const isKVAvailable = (): boolean => {
    try {
        return !!process.env.KV_URL && !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN
    } catch {
        return false
    }
}

// Database keys
const KEYS = {
    PRODUCTS: (storeId: string) => `products:${storeId}`,
    CUSTOMERS: 'customers',
    PURCHASES: 'purchases'
}

// Helper functions for localStorage fallback
const getLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
    }
    return null
}

const setLocalStorage = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data))
    }
}

// Products CRUD
export class ProductService {
    static async getAll(storeId: string): Promise<Product[]> {
        if (isKVAvailable()) {
            try {
                const products = await kv.get<Product[]>(KEYS.PRODUCTS(storeId))
                return products || []
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        return getLocalStorage(`products_${storeId}`) || []
    }

    static async add(storeId: string, productData: Omit<Product, 'id'>): Promise<Product> {
        const product: Product = {
            ...productData,
            id: uuidv4()
        }

        if (isKVAvailable()) {
            try {
                const products = await this.getAll(storeId)
                products.push(product)
                await kv.set(KEYS.PRODUCTS(storeId), products)
                return product
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const products = getLocalStorage(`products_${storeId}`) || []
        products.push(product)
        setLocalStorage(`products_${storeId}`, products)
        return product
    }

    static async update(storeId: string, productId: string, updates: Partial<Product>): Promise<void> {
        if (isKVAvailable()) {
            try {
                const products = await this.getAll(storeId)
                const index = products.findIndex(p => p.id === productId)
                if (index !== -1) {
                    products[index] = { ...products[index], ...updates }
                    await kv.set(KEYS.PRODUCTS(storeId), products)
                    return
                }
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const products = getLocalStorage(`products_${storeId}`) || []
        const index = products.findIndex((p: Product) => p.id === productId)
        if (index !== -1) {
            products[index] = { ...products[index], ...updates }
            setLocalStorage(`products_${storeId}`, products)
        }
    }

    static async delete(storeId: string, productId: string): Promise<void> {
        if (isKVAvailable()) {
            try {
                const products = await this.getAll(storeId)
                const filtered = products.filter(p => p.id !== productId)
                await kv.set(KEYS.PRODUCTS(storeId), filtered)
                return
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const products = getLocalStorage(`products_${storeId}`) || []
        const filtered = products.filter((p: Product) => p.id !== productId)
        setLocalStorage(`products_${storeId}`, filtered)
    }
}

// Customers CRUD
export class CustomerService {
    static async getAll(): Promise<Customer[]> {
        if (isKVAvailable()) {
            try {
                const customers = await kv.get<Customer[]>(KEYS.CUSTOMERS)
                return customers || []
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        return getLocalStorage('customers') || []
    }

    static async add(customerData: Omit<Customer, 'id'>): Promise<Customer> {
        const customer: Customer = {
            ...customerData,
            id: uuidv4()
        }

        if (isKVAvailable()) {
            try {
                const customers = await this.getAll()
                customers.push(customer)
                await kv.set(KEYS.CUSTOMERS, customers)
                return customer
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const customers = getLocalStorage('customers') || []
        customers.push(customer)
        setLocalStorage('customers', customers)
        return customer
    }

    static async update(customerId: string, updates: Partial<Customer>): Promise<void> {
        if (isKVAvailable()) {
            try {
                const customers = await this.getAll()
                const index = customers.findIndex(c => c.id === customerId)
                if (index !== -1) {
                    customers[index] = { ...customers[index], ...updates }
                    await kv.set(KEYS.CUSTOMERS, customers)
                    return
                }
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const customers = getLocalStorage('customers') || []
        const index = customers.findIndex((c: Customer) => c.id === customerId)
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates }
            setLocalStorage('customers', customers)
        }
    }

    static async delete(customerId: string): Promise<void> {
        if (isKVAvailable()) {
            try {
                const customers = await this.getAll()
                const filtered = customers.filter(c => c.id !== customerId)
                await kv.set(KEYS.CUSTOMERS, filtered)
                return
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const customers = getLocalStorage('customers') || []
        const filtered = customers.filter((c: Customer) => c.id !== customerId)
        setLocalStorage('customers', filtered)
    }
}

// Purchases CRUD
export class PurchaseService {
    static async getAll(): Promise<Purchase[]> {
        if (isKVAvailable()) {
            try {
                const purchases = await kv.get<Purchase[]>(KEYS.PURCHASES)
                return purchases || []
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        return getLocalStorage('purchases') || []
    }

    static async add(purchaseData: Omit<Purchase, 'id'>): Promise<Purchase> {
        const purchase: Purchase = {
            ...purchaseData,
            id: uuidv4()
        }

        if (isKVAvailable()) {
            try {
                const purchases = await this.getAll()
                purchases.push(purchase)
                await kv.set(KEYS.PURCHASES, purchases)
                return purchase
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const purchases = getLocalStorage('purchases') || []
        purchases.push(purchase)
        setLocalStorage('purchases', purchases)
        return purchase
    }

    static async delete(purchaseId: string): Promise<void> {
        if (isKVAvailable()) {
            try {
                const purchases = await this.getAll()
                const filtered = purchases.filter(p => p.id !== purchaseId)
                await kv.set(KEYS.PURCHASES, filtered)
                return
            } catch (error) {
                console.warn('KV failed, falling back to localStorage:', error)
            }
        }

        // Fallback to localStorage
        const purchases = getLocalStorage('purchases') || []
        const filtered = purchases.filter((p: Purchase) => p.id !== purchaseId)
        setLocalStorage('purchases', filtered)
    }
}

// Auth Service
export class AuthService {
    static async login(credentials: { username: string; password: string }): Promise<{ success: boolean; user?: string }> {
        const validUsers = [
            { username: 'admin', password: 'admin123' },
            { username: 'manager', password: 'manager123' }
        ]

        const user = validUsers.find(u =>
            u.username === credentials.username &&
            u.password === credentials.password
        )

        if (!user) {
            throw new Error('Буруу нэвтрэх нэр эсвэл нууц үг')
        }

        return { success: true, user: credentials.username }
    }
}