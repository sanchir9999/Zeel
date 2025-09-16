export default function FeaturesPage() {
    return (
        <section className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 text-slate-700">Боломжууд</h1>
            <div className="space-y-6 text-slate-700">
                <p>
                    Манай үйлчилгээ нь таны эзэмшиж буй <strong>худалдан авалтын зээлийн эрхийг</strong> шууд бэлэн
                    мөнгө болгон хувиргах боломжийг олгодог.
                </p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Та зээлийн апп дээр <strong>худалдан авалтын эрхээ тогтооно</strong>.</li>
                    <li>Үүний дараа <strong>манайтай холбогдоно</strong>.</li>
                    <li>
                        Бид таниас <strong>багахан хэмжээний шимтгэл</strong> аваад танд шууд{" "}
                        <strong>бэлэн мөнгө</strong> гаргаж өгнө.
                    </li>
                </ol>
                <p className="mt-4 text-blue-700 font-medium">
                    👉 Энэ бүхэн хурдан, уян хатан, найдвартай хийгдэнэ.
                </p>
            </div>
        </section>
    );
}
