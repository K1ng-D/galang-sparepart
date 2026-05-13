import Link from "next/link";
import {
  ArrowRight,
  Bike,
  ClipboardList,
  Cpu,
  History,
  Wrench,
} from "lucide-react";

export default function UserDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard User</h1>
        <p className="mt-2 text-slate-600">
          Selamat datang di sistem rekomendasi kombinasi sparepart untuk bore up
          motor.
        </p>
      </div>

      <div className="mb-8 rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Bike size={30} />
            </div>

            <h2 className="text-3xl font-bold">
              Temukan Kombinasi Sparepart Bore Up Terbaik
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Masukkan jenis motor, kapasitas mesin, tipe penggunaan, dan
              budget. Sistem akan memberikan rekomendasi berdasarkan metode
              Content-Based Filtering.
            </p>
          </div>

          <Link
            href="/dashboard/rekomendasi"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Mulai Rekomendasi
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Wrench size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Input Kebutuhan</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            User mengisi jenis motor, kapasitas mesin, tipe penggunaan, budget,
            dan kebutuhan bore up.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Cpu size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Proses CBF</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sistem membandingkan input user dengan data kombinasi sparepart
            menggunakan perhitungan similarity.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <ClipboardList size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Hasil Rekomendasi</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sistem menampilkan ranking kombinasi sparepart paling sesuai dengan
            kebutuhan pengguna.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href="/dashboard/rekomendasi"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                Buat Rekomendasi Baru
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Mulai pencarian kombinasi sparepart bore up.
              </p>
            </div>

            <ArrowRight className="text-orange-500" />
          </div>
        </Link>

        <Link
          href="/dashboard/hasil"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Riwayat Rekomendasi</h3>
              <p className="mt-2 text-sm text-slate-600">
                Lihat hasil rekomendasi yang pernah dibuat.
              </p>
            </div>

            <History className="text-orange-500" />
          </div>
        </Link>
      </div>
    </div>
  );
}
