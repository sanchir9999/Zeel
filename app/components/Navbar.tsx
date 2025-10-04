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
        // Close mobile menu when route changes
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
    if (pathname === '/login') {
        return null
    }

    return (
        <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Brand */}
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/"}
                        className="text-lg font-bold tracking-tight text-blue-700 flex-shrink-0"
                    >
                        <span className="hidden sm:inline">Дэлгүүрийн Касын Систем</span>
                        <span className="sm:hidden">Касын Систем</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isLoggedIn ? (
                        <>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link
                                    href="/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/customers"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/customers'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Харилцагчид
                                </Link>
                                <Link
                                    href="/reports"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/reports'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Тайлан
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                >
                                    Гарах
                                </button>
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-expanded="false"
                                >
                                    <span className="sr-only">Цэс нээх</span>
                                    {/* Hamburger icon */}
                                    <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    {/* Close icon */}
                                    <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            >
                                Нэвтрэх
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {isLoggedIn && isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="/dashboard"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === '/dashboard'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/customers"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === '/customers'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                }`}
                        >
                            Харилцагчид
                        </Link>
                        <Link
                            href="/reports"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === '/reports'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                                }`}
                        >
                            Тайлан
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                            Гарах
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
