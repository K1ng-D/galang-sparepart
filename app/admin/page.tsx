"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  ClipboardList,
  Package,
  Tags,
  Users,
  TrendingUp,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboardPage() {
  const [totalSparepart, setTotalSparepart] = useState(0);
  const [totalKombinasi, setTotalKombinasi] = useState(0);
  const [totalKategori, setTotalKategori] = useState(0);
  const [totalUser, setTotalUser] = useState(0);
  const [totalRekomendasi, setTotalRekomendasi] = useState(0);

  useEffect(() => {
    const unsubSparepart = onSnapshot(
      collection(db, "spareparts"),
      (snapshot) => {
        setTotalSparepart(snapshot.size);
      },
    );

    const unsubKombinasi = onSnapshot(
      collection(db, "kombinasi"),
      (snapshot) => {
        setTotalKombinasi(snapshot.size);
      },
    );

    const unsubKategori = onSnapshot(collection(db, "kategori"), (snapshot) => {
      setTotalKategori(snapshot.size);
    });

    const unsubUser = onSnapshot(collection(db, "users"), (snapshot) => {
      setTotalUser(snapshot.size);
    });

    const unsubHasil = onSnapshot(
      collection(db, "hasil_rekomendasi"),
      (snapshot) => {
        setTotalRekomendasi(snapshot.size);
      },
    );

    return () => {
      unsubSparepart();
      unsubKombinasi();
      unsubKategori();
      unsubUser();
      unsubHasil();
    };
  }, []);

  const stats = [
    {
      title: "Total Sparepart",
      value: totalSparepart,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Kombinasi",
      value: totalKombinasi,
      icon: Boxes,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Kategori",
      value: totalKategori,
      icon: Tags,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "User",
      value: totalUser,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Hasil Rekomendasi",
      value: totalRekomendasi,
      icon: ClipboardList,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>

        <p className="mt-2 text-slate-600">
          Kelola data sparepart, kombinasi bore up, pengguna, dan hasil
          rekomendasi secara realtime.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.title}</p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <TrendingUp size={22} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Ringkasan Sistem
            </h2>
          </div>

          <div className="space-y-3 text-slate-600">
            <p>
              • Total sparepart yang tersedia:
              <span className="ml-2 font-bold text-slate-900">
                {totalSparepart}
              </span>
            </p>

            <p>
              • Total kombinasi bore up:
              <span className="ml-2 font-bold text-slate-900">
                {totalKombinasi}
              </span>
            </p>

            <p>
              • Total user terdaftar:
              <span className="ml-2 font-bold text-slate-900">{totalUser}</span>
            </p>

            <p>
              • Total rekomendasi yang pernah dibuat:
              <span className="ml-2 font-bold text-slate-900">
                {totalRekomendasi}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Alur Sistem Rekomendasi
          </h2>

          <div className="mt-4 space-y-4 text-slate-600 leading-7">
            <p>
              1. Admin mengelola data sparepart seperti piston, ECU, injector,
              throttle body, radiator, coil, fuel pump, dan sparepart lainnya.
            </p>

            <p>
              2. Admin membuat kombinasi bore up berdasarkan sparepart yang
              tersedia.
            </p>

            <p>
              3. User memasukkan jenis motor, kapasitas mesin, tipe penggunaan,
              budget, dan kebutuhan.
            </p>

            <p>
              4. Sistem menggunakan Content-Based Filtering dan Cosine
              Similarity untuk mencari kombinasi paling sesuai.
            </p>

            <p>
              5. Hasil ditampilkan dalam bentuk ranking rekomendasi terbaik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
