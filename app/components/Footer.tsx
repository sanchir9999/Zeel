import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                    {/* Brand */}
                    <div>
                        <div className="text-lg font-bold text-blue-700">Зээлийн эрхийн шуурхай үйлчилгээ</div>
                        <p className="mt-1 text-sm text-slate-500">
                            Худалдан авалтын зээлийн эрхийг бэлэн мөнгө болгон хувиргах үйлчилгээ
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                        <Link href="/" className="hover:text-blue-700 transition-colors">
                            Нүүр
                        </Link>
                        <Link href="/order" className="hover:text-blue-700 transition-colors">
                            Захиалга
                        </Link>
                        <Link href="/privacy" className="hover:text-blue-700 transition-colors">
                            Нууцлал
                        </Link>
                        <Link href="/terms" className="hover:text-blue-700 transition-colors">
                            Үйлчилгээний нөхцөл
                        </Link>
                    </div>
                </div>

                {/* Bottom strip */}
                <div className="mt-4 border-t pt-4 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} Зээлийн Апп — Бүх эрх хуулиар хамгаалагдсан
                </div>
            </div>
        </footer>
    );
}
