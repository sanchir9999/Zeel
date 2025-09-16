import Link from "next/link";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
});

export default function HomePage() {
  return (
    <section
      className={`${rubik.variable} relative bg-gradient-to-b from-white to-slate-50 font-sans`}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Худалдан авалтын зээлийн эрхээ{" "}
          <span className="text-blue-700">бэлэн мөнгө</span> болгон хувирга
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Танд олгогдсон худалдан авалтын зээлийн лимитийг бид шууд{" "}
          <strong>бэлэн мөнгө</strong> болгож гаргаж өгнө.
          Шуурхай, уян хатан, найдвартай үйлчилгээ.
        </p>

        {/* Шаардлагын блок */}
        <div className="mx-auto mt-6 max-w-xl rounded-xl border bg-white/70 px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-blue-700">Шаардлага:</span>{" "}
            Та зөвхөн зээлийн болон худалдан авалтын зээлийн апп дээр бүртгэлтэй,
            зээл авах эрхтэй байхад л хангалттай.
          </p>
        </div>

        // ...
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/order"
            className="rounded-xl bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-800"
          >
            Захиалга өгөх
          </Link>

          {/* ЭНДХҮҮ: <a href="#features"> … </a> → <Link href="/features"> … </Link> */}
          <Link
            href="/features"
            className="rounded-xl border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-white"
          >
            Илүү мэдээлэл
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ---------- tiny UI atoms (inline for simplicity) ---------- */
function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
        <span className="text-sm text-blue-700">◆</span>
      </div>
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-right text-lg font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
