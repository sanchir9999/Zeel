'use client'

export default function OrderPage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 text-slate-700">Захиалга өгөх</h1>
            {/* Зөвхөн утсаар холбогдох хэсэг */}
            <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Захиалга өгөх бол зөвхөн дараах дугаараар холбогдоно уу:
                </p>
                <p className="mt-2 text-lg font-bold text-blue-700">9998-3923</p>
            </div>
        </section>
    );
}
