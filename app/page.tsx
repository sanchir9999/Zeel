'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Нэвтрэх статусыг шалгах
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn === 'true') {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h1 className="text-xl text-gray-600 mt-4">Ачааллаж байна...</h1>
      </div>
    </div>
  );
}
