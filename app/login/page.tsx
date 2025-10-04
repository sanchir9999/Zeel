'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Use the hybrid data client that handles API/localStorage fallback
            const { DataClient } = await import('@/lib/api-client')
            const result = await DataClient.login({ username, password }) as { success: boolean; user?: string }

            if (result.success) {
                // Store login state in localStorage for client-side persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('username', username)
                router.push('/dashboard')
            }
        } catch (error) {
            setError('Хэрэглэгчийн нэр эсвэл нууц үг буруу байна')
            console.error('Login error:', error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Дэлгүүрийн Касын Систем
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Нэвтрэх нэр болон нууц үгээ оруулна уу
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Хэрэглэгчийн нэр
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base sm:text-sm"
                                placeholder="Хэрэглэгчийн нэр"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Нууц үг
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base sm:text-sm"
                                placeholder="Нууц үг"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Нэвтрэх
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900 mb-2">Демо эрх:</p>
                    <p className="text-blue-700">Хэрэглэгчийн нэр: <span className="font-mono bg-white px-2 py-1 rounded">admin</span></p>
                    <p className="text-blue-700">Нууц үг: <span className="font-mono bg-white px-2 py-1 rounded">password123</span></p>
                </div>
            </div>
        </div>
    )
}