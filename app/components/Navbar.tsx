import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo / Brand */}
                <Link href="/" className="text-lg font-bold tracking-tight text-blue-700">
                    Зээлийн эрхийн шуурхай үйлчилгээ
                </Link>

                {/* Navigation links */}
                <div className="flex items-center gap-8 text-sm font-medium text-slate-700">
                    <Link href="/" className="hover:text-blue-700 transition-colors">
                        Нүүр
                    </Link>
                    <Link href="/order" className="hover:text-blue-700 transition-colors">
                        Захиалга
                    </Link>
                    <Link href="/features" className="hover:text-blue-700 transition-colors">
                        Боломжууд
                    </Link>
                </div>
            </div>
        </nav>
    );
}
