import Link from "next/link";
import { ArrowRight, Bike, Cpu, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/20 text-orange-400">
          <Bike size={42} />
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          Sistem Rekomendasi Kombinasi Sparepart untuk Bore Up Motor
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
          Aplikasi berbasis web untuk membantu pengguna menentukan kombinasi
          sparepart bore up motor menggunakan metode Content-Based Filtering.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Masuk ke Sistem
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-900"
          >
            Login Admin
          </Link>
        </div>

        <div className="mt-16 grid w-full max-w-4xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
            <Wrench className="text-orange-400" />
            <h3 className="mt-4 font-bold">Data Sparepart</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Mengelola data piston, blok mesin, camshaft, ECU, injektor,
              karburator, dan knalpot.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
            <Cpu className="text-orange-400" />
            <h3 className="mt-4 font-bold">Metode CBF</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Rekomendasi dihitung berdasarkan kemiripan atribut sparepart
              dengan kebutuhan pengguna.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left">
            <Bike className="text-orange-400" />
            <h3 className="mt-4 font-bold">Bore Up Motor</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Membantu memilih kombinasi sparepart yang sesuai untuk kebutuhan
              harian maupun performa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
