import { Redis } from '@upstash/redis'
import { Order } from './types'

// Redis client configuration
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Redis keys
const REDIS_KEYS = {
    ORDERS: 'orders',
    ORDER_BY_ID: (id: string) => `order:${id}`,
    DAILY_ORDERS: (date: string) => `orders:daily:${date}`
}

export class OrderService {
    // Get all orders
    static async getAll(): Promise<Order[]> {
        try {
            const orders = await redis.get<Order[]>(REDIS_KEYS.ORDERS)
            return orders || []
        } catch (error) {
            console.error('Error fetching orders from Redis:', error)
            return []
        }
    }

    // Add new order
    static async add(orderData: Omit<Order, 'id'>): Promise<Order> {
        try {
            const order: Order = {
                ...orderData,
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }

            // Get existing orders
            const existingOrders = await this.getAll()
            
            // Add new order
            existingOrders.push(order)
            
            // Save back to Redis
            await redis.set(REDIS_KEYS.ORDERS, existingOrders)
            
            // Also save individual order for quick access
            await redis.set(REDIS_KEYS.ORDER_BY_ID(order.id), order)
            
            // Add to daily orders for analytics
            const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            const dailyOrders = await redis.get<Order[]>(REDIS_KEYS.DAILY_ORDERS(today)) || []
            dailyOrders.push(order)
            await redis.set(REDIS_KEYS.DAILY_ORDERS(today), dailyOrders)

            console.log('Order saved to Redis:', order.id)
            return order
        } catch (error) {
            console.error('Error saving order to Redis:', error)
            throw new Error('Failed to save order')
        }
    }

    // Get order by ID
    static async getById(id: string): Promise<Order | null> {
        try {
            const order = await redis.get<Order>(REDIS_KEYS.ORDER_BY_ID(id))
            return order || null
        } catch (error) {
            console.error('Error fetching order by ID from Redis:', error)
            return null
        }
    }

    // Get daily orders for analytics
    static async getDailyOrders(date: string): Promise<Order[]> {
        try {
            const orders = await redis.get<Order[]>(REDIS_KEYS.DAILY_ORDERS(date))
            return orders || []
        } catch (error) {
            console.error('Error fetching daily orders from Redis:', error)
            return []
        }
    }

    // Calculate daily revenue
    static async getDailyRevenue(date: string): Promise<number> {
        try {
            const dailyOrders = await this.getDailyOrders(date)
            return dailyOrders
                .filter(order => order.status === 'completed')
                .reduce((sum, order) => sum + order.totalAmount, 0)
        } catch (error) {
            console.error('Error calculating daily revenue:', error)
            return 0
        }
    }

    // Delete order
    static async deleteById(id: string): Promise<boolean> {
        try {
            // Remove from main orders list
            const allOrders = await this.getAll()
            const filteredOrders = allOrders.filter(order => order.id !== id)
            await redis.set(REDIS_KEYS.ORDERS, filteredOrders)
            
            // Remove individual order
            await redis.del(REDIS_KEYS.ORDER_BY_ID(id))
            
            return true
        } catch (error) {
            console.error('Error deleting order from Redis:', error)
            return false
        }
    }
}