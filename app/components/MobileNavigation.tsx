'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNavigation() {
    const pathname = usePathname()

    const navItems = [
        {
            href: '/dashboard',
            icon: '🏠',
            label: 'Нүүр',
            active: pathname === '/dashboard'
        },
        {
            href: '/order',
            icon: '🛒',
            label: 'Захиалга',
            active: pathname === '/order'
        },
        {
            href: '/orders/history',
            icon: '📋',
            label: 'Захиалгын хуудас',
            active: pathname === '/orders/history'
        },
        {
            href: '/customers',
            icon: '👥',
            label: 'Харилцагч',
            active: pathname === '/customers'
        },
        {
            href: '/reports',
            icon: '📊',
            label: 'Тайлан',
            active: pathname === '/reports'
        }
    ]

    // Don't show on login page
    if (pathname === '/login' || pathname === '/') {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden shadow-lg">
            <div className="grid grid-cols-5 py-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ease-in-out transform hover:scale-105 ${item.active
                            ? 'text-white bg-blue-600 rounded-lg mx-1 shadow-md'
                            : 'text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg mx-1'
                            }`}
                    >
                        <span className={`text-xl mb-1 transition-transform duration-300 ${item.active ? 'scale-110' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                        {item.active && (
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}