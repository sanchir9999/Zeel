import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Simple auth check
        const validUsers = [
            { username: 'admin', password: 'admin123' },
            { username: 'manager', password: 'manager123' }
        ]

        const user = validUsers.find(u =>
            u.username === username &&
            u.password === password
        )

        if (!user) {
            return NextResponse.json(
                { error: 'Буруу нэвтрэх нэр эсвэл нууц үг' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            success: true,
            user: username
        })
    } catch (error) {
        console.error('Error during login:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}