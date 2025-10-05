'use client'

import Link from "next/link";
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn')
        setIsLoggedIn(loggedIn === 'true')
        setIsMobileMenuOpen(false)
    }, [pathname])

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        setIsLoggedIn(false)
        setIsMobileMenuOpen(false)
        router.push('/login')
    }

    // Login хуудсанд navbar харуулахгүй
    if (pathname === '/login' || pathname === '/dashboard') {
        return null
    }

    return (
        <>
            {/* Top Navigation - для store pages etc */}
            <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm font-medium">Буцах</span>
                        </button>

                        {/* Page Title */}
                        <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">
                            {pathname.includes('/store/') ? 'Дэлгүүр' :
                                pathname === '/customers' ? 'Харилцагчид' :
                                    pathname === '/reports' ? 'Тайлан' : 'Store POS'}
                        </h1>

                        {/* Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        {/* Menu Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xl">🏪</span>
                                    </div>
                                    <div>
                                        <h2 className="text-white font-semibold text-lg">Өргөтгөл 241</h2>
                                        <p className="text-white/80 text-sm">{localStorage.getItem('username')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-white/80 hover:text-white p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-4 space-y-2">
                            <Link
                                href="/dashboard"
                                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${pathname === '/dashboard'
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-xl">🏠</span>
                                <span className="font-medium">Dashboard</span>
                            </Link>

                            <Link
                                href="/customers"
                                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${pathname === '/customers'
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-xl">👥</span>
                                <span className="font-medium">Харилцагчид</span>
                            </Link>

                            <Link
                                href="/reports"
                                className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${pathname === '/reports'
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-xl">📊</span>
                                <span className="font-medium">Тайлан</span>
                            </Link>

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4"></div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
                            >
                                <span className="text-xl">🚪</span>
                                <span className="font-medium">Гарах</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
