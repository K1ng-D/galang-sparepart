import { Boxes, ClipboardList, Package, Tags, Users } from "lucide-react";

const stats = [
  {
    title: "Total Sparepart",
    value: "0",
    icon: Package,
  },
  {
    title: "Total Kombinasi",
    value: "0",
    icon: Boxes,
  },
  {
    title: "Kategori",
    value: "0",
    icon: Tags,
  },
  {
    title: "User",
    value: "0",
    icon: Users,
  },
  {
    title: "Hasil Rekomendasi",
    value: "0",
    icon: ClipboardList,
  },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-2 text-slate-600">
          Kelola data sparepart, kombinasi bore up, dan hasil rekomendasi.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Alur Sistem Rekomendasi
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          Admin mengelola data sparepart dan data kombinasi bore up. Data
          tersebut akan digunakan sebagai basis perhitungan Content-Based
          Filtering. User kemudian mengisi kebutuhan motor, budget, dan tipe
          penggunaan. Sistem akan membandingkan input user dengan data kombinasi
          yang tersedia untuk menghasilkan rekomendasi paling sesuai.
        </p>
      </div>
    </div>
  );
}
