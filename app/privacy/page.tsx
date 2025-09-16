export default function PrivacyPage() {
    return (
        <section className="mx-auto max-w-4xl px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 text-slate-700">Нууцлалын бодлого</h1>
            <div className="space-y-4 text-slate-700 text-sm leading-6">
                <p>
                    “Зээлийн Апп” нь хэрэглэгчийн хувийн мэдээллийн аюулгүй байдлыг хамгаалахад
                    анхаардаг. Бид таны мэдээллийг гуравдагч этгээдэд задруулахгүй бөгөөд
                    зөвхөн үйлчилгээ үзүүлэх зорилгоор ашиглана.
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Хэрэглэгчийн нэр, имэйл, холбогдох мэдээлэл зөвхөн дотоод хэрэглээнд хадгалагдана.</li>
                    <li>Мэдээлэл хамгаалалт нь нууцлалын стандартын дагуу хийгдэнэ.</li>
                    <li>Хэрэглэгч хүссэн үедээ өөрийн мэдээллийг устгуулах боломжтой.</li>
                </ul>
            </div>
        </section>
    );
}
