"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ClipboardList, Eye, Search, Trash2 } from "lucide-react";

type HasilRekomendasi = {
  id: string;
  userId: string;
  inputUser?: {
    jenisMotor?: string;
    kapasitasMesin?: string;
    tipePenggunaan?: string;
    budget?: number;
    kebutuhan?: string;
  };
  hasil?: {
    namaKombinasi: string;
    similarityScore: number;
  }[];
  createdAt?: {
    seconds: number;
  };
};

export default function RiwayatHasilPage() {
  const [data, setData] = useState<HasilRekomendasi[]>([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "hasil_rekomendasi"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as HasilRekomendasi[];

      setData(result);
    });

    return () => unsubscribe();
  }, [userId]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.inputUser?.jenisMotor?.toLowerCase().includes(keyword) ||
        item.inputUser?.kapasitasMesin?.toLowerCase().includes(keyword) ||
        item.inputUser?.tipePenggunaan?.toLowerCase().includes(keyword) ||
        item.inputUser?.kebutuhan?.toLowerCase().includes(keyword) ||
        item.hasil?.[0]?.namaKombinasi?.toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus riwayat ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "hasil_rekomendasi", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus riwayat.");
    }
  };

  const formatRupiah = (value?: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (seconds?: number) => {
    if (!seconds) return "-";
    return new Date(seconds * 1000).toLocaleString("id-ID");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Riwayat Rekomendasi
          </h1>
          <p className="mt-2 text-slate-600">
            Lihat hasil rekomendasi sparepart bore up yang pernah dibuat.
          </p>
        </div>

        <Link
          href="/dashboard/rekomendasi"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Buat Rekomendasi Baru
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            placeholder="Cari motor, kapasitas, penggunaan, atau rekomendasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Daftar Riwayat</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total data: {filteredData.length}
          </p>
        </div>

        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <ClipboardList size={32} />
            </div>
            <h3 className="font-bold text-slate-900">
              Belum ada riwayat rekomendasi
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Riwayat rekomendasi akan muncul setelah kamu melakukan pencarian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4">Input User</th>
                  <th className="px-5 py-4">Top Rekomendasi</th>
                  <th className="px-5 py-4">Similarity</th>
                  <th className="px-5 py-4">Budget</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredData.map((item) => {
                  const top = item.hasil?.[0];

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {item.inputUser?.jenisMotor || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.inputUser?.kapasitasMesin || "-"} •{" "}
                          {item.inputUser?.tipePenggunaan || "-"}
                        </p>
                        <p className="mt-1 line-clamp-1 max-w-[320px] text-xs text-slate-500">
                          {item.inputUser?.kebutuhan || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {top?.namaKombinasi || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {top
                            ? `${(top.similarityScore * 100).toFixed(2)}%`
                            : "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatRupiah(item.inputUser?.budget)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(item.createdAt?.seconds)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/hasil/${item.id}`}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye size={17} />
                          </Link>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
