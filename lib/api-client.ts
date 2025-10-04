// API Client for interacting with our backend
import { Product, Customer, Purchase } from './types'

export class ApiClient {
    private static baseUrl = '/api'

    // Generic API call method
    private static async apiCall(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<unknown> {
        const url = `${this.baseUrl}${endpoint}`

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
            },
        }

        const response = await fetch(url, { ...defaultOptions, ...options })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }))
            throw new Error(error.error || `HTTP ${response.status}`)
        }

        return response.json()
    }

    // Products API
    static async getProducts(storeId: string) {
        return this.apiCall(`/products/${storeId}`)
    }

    static async addProduct(storeId: string, product: Omit<Product, 'id'>) {
        return this.apiCall(`/products/${storeId}`, {
            method: 'POST',
            body: JSON.stringify(product)
        })
    }

    static async updateProduct(storeId: string, productId: string, updates: Partial<Product>) {
        return this.apiCall(`/products/${storeId}`, {
            method: 'PUT',
            body: JSON.stringify({ productId, ...updates })
        })
    }

    static async deleteProduct(storeId: string, productId: string) {
        return this.apiCall(`/products/${storeId}?productId=${productId}`, {
            method: 'DELETE'
        })
    }

    // Customers API
    static async getCustomers() {
        return this.apiCall('/customers')
    }

    static async addCustomer(customer: Omit<Customer, 'id'>) {
        return this.apiCall('/customers', {
            method: 'POST',
            body: JSON.stringify(customer)
        })
    }

    static async deleteCustomer(customerId: string) {
        return this.apiCall(`/customers?customerId=${customerId}`, {
            method: 'DELETE'
        })
    }

    // Purchases API
    static async getPurchases() {
        return this.apiCall('/purchases')
    }

    static async addPurchase(purchase: Omit<Purchase, 'id'>) {
        return this.apiCall('/purchases', {
            method: 'POST',
            body: JSON.stringify(purchase)
        })
    }

    // Auth API
    static async login(credentials: { username: string; password: string }) {
        return this.apiCall('/auth', {
            method: 'POST',
            body: JSON.stringify(credentials)
        })
    }
}

// localStorage fallback client
export class LocalStorageClient {
    // Products localStorage operations
    static async getProducts(storeId: string): Promise<Product[]> {
        if (typeof window === 'undefined') return []

        const products = localStorage.getItem(`products_${storeId}`)
        return products ? JSON.parse(products) : []
    }

    static async addProduct(storeId: string, product: Omit<Product, 'id'>): Promise<Product> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const products = await this.getProducts(storeId)
        const newProduct: Product = {
            ...product,
            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        products.push(newProduct)
        localStorage.setItem(`products_${storeId}`, JSON.stringify(products))
        return newProduct
    }

    static async updateProduct(storeId: string, productId: string, updates: Partial<Product>): Promise<void> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const products = await this.getProducts(storeId)
        const index = products.findIndex(p => p.id === productId)

        if (index !== -1) {
            products[index] = { ...products[index], ...updates }
            localStorage.setItem(`products_${storeId}`, JSON.stringify(products))
        }
    }

    static async deleteProduct(storeId: string, productId: string): Promise<void> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const products = await this.getProducts(storeId)
        const filtered = products.filter(p => p.id !== productId)
        localStorage.setItem(`products_${storeId}`, JSON.stringify(filtered))
    }

    // Customers localStorage operations
    static async getCustomers(): Promise<Customer[]> {
        if (typeof window === 'undefined') return []

        const customers = localStorage.getItem('customers')
        return customers ? JSON.parse(customers) : []
    }

    static async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const customers = await this.getCustomers()
        const newCustomer: Customer = {
            ...customer,
            id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        customers.push(newCustomer)
        localStorage.setItem('customers', JSON.stringify(customers))
        return newCustomer
    }

    static async deleteCustomer(customerId: string): Promise<void> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const customers = await this.getCustomers()
        const filtered = customers.filter(c => c.id !== customerId)
        localStorage.setItem('customers', JSON.stringify(filtered))
    }

    // Purchases localStorage operations
    static async getPurchases(): Promise<Purchase[]> {
        if (typeof window === 'undefined') return []

        const purchases = localStorage.getItem('purchases')
        return purchases ? JSON.parse(purchases) : []
    }

    static async addPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
        if (typeof window === 'undefined') throw new Error('localStorage not available')

        const purchases = await this.getPurchases()
        const newPurchase: Purchase = {
            ...purchase,
            id: `purch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        purchases.push(newPurchase)
        localStorage.setItem('purchases', JSON.stringify(purchases))
        return newPurchase
    }

    // Auth localStorage operations
    static async login(credentials: { username: string; password: string }): Promise<unknown> {
        // Simulate login - in real app, verify credentials
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

        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUser', credentials.username)
        }

        return { success: true, user: credentials.username }
    }
}

// Hybrid client that tries API first, falls back to localStorage
export class DataClient {
    private static async withFallback<T>(
        apiMethod: () => Promise<T>,
        localMethod: () => Promise<T>
    ): Promise<T> {
        try {
            return await apiMethod()
        } catch (error) {
            console.warn('API call failed, falling back to localStorage:', error)
            return await localMethod()
        }
    }

    // Products
    static async getProducts(storeId: string): Promise<Product[]> {
        return this.withFallback(
            () => ApiClient.getProducts(storeId) as Promise<Product[]>,
            () => LocalStorageClient.getProducts(storeId)
        )
    }

    static async addProduct(storeId: string, product: Omit<Product, 'id'>): Promise<Product> {
        return this.withFallback(
            () => ApiClient.addProduct(storeId, product) as Promise<Product>,
            () => LocalStorageClient.addProduct(storeId, product)
        )
    }

    static async updateProduct(storeId: string, productId: string, updates: Partial<Product>): Promise<void> {
        return this.withFallback(
            () => ApiClient.updateProduct(storeId, productId, updates) as Promise<void>,
            () => LocalStorageClient.updateProduct(storeId, productId, updates)
        )
    }

    static async deleteProduct(storeId: string, productId: string): Promise<void> {
        return this.withFallback(
            () => ApiClient.deleteProduct(storeId, productId) as Promise<void>,
            () => LocalStorageClient.deleteProduct(storeId, productId)
        )
    }

    // Customers
    static async getCustomers(): Promise<Customer[]> {
        return this.withFallback(
            () => ApiClient.getCustomers() as Promise<Customer[]>,
            () => LocalStorageClient.getCustomers()
        )
    }

    static async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
        return this.withFallback(
            () => ApiClient.addCustomer(customer) as Promise<Customer>,
            () => LocalStorageClient.addCustomer(customer)
        )
    }

    static async deleteCustomer(customerId: string): Promise<void> {
        return this.withFallback(
            () => ApiClient.deleteCustomer(customerId) as Promise<void>,
            () => LocalStorageClient.deleteCustomer(customerId)
        )
    }

    // Purchases
    static async getPurchases(): Promise<Purchase[]> {
        return this.withFallback(
            () => ApiClient.getPurchases() as Promise<Purchase[]>,
            () => LocalStorageClient.getPurchases()
        )
    }

    static async addPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
        return this.withFallback(
            () => ApiClient.addPurchase(purchase) as Promise<Purchase>,
            () => LocalStorageClient.addPurchase(purchase)
        )
    }

    // Auth
    static async login(credentials: { username: string; password: string }): Promise<unknown> {
        return this.withFallback(
            () => ApiClient.login(credentials),
            () => LocalStorageClient.login(credentials)
        )
    }
}