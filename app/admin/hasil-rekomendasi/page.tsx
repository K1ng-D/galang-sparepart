"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClipboardList, Search, Trash2 } from "lucide-react";

type HasilRekomendasi = {
  id: string;
  userName?: string;
  userEmail?: string;
  inputUser?: {
    jenisMotor?: string;
    kapasitasMesin?: string;
    tipePenggunaan?: string;
    budget?: number;
  };
  hasil?: {
    namaKombinasi: string;
    similarityScore: number;
  }[];
  createdAt?: {
    seconds: number;
  };
};

export default function AdminHasilRekomendasiPage() {
  const [data, setData] = useState<HasilRekomendasi[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 Ambil data realtime dari Firestore
  useEffect(() => {
    const q = query(
      collection(db, "hasil_rekomendasi"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HasilRekomendasi[];

      setData(result);
    });

    return () => unsubscribe();
  }, []);

  // 🔍 Filter search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.userName?.toLowerCase().includes(keyword) ||
        item.userEmail?.toLowerCase().includes(keyword) ||
        item.inputUser?.jenisMotor?.toLowerCase().includes(keyword)
      );
    });
  }, [data, search]);

  // ❌ delete
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin hapus data ini?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "hasil_rekomendasi", id));
  };

  const formatDate = (seconds?: number) => {
    if (!seconds) return "-";
    return new Date(seconds * 1000).toLocaleString("id-ID");
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hasil Rekomendasi</h1>
        <p className="mt-2 text-slate-600">Riwayat rekomendasi user</p>
      </div>

      {/* SEARCH */}
      <div className="mb-6 rounded-xl border p-4 bg-white">
        <div className="flex items-center gap-3">
          <Search size={18} />
          <input
            placeholder="Cari user atau motor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Total Data: {filteredData.length}</h2>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <ClipboardList size={40} className="mx-auto mb-3" />
            Belum ada data
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Motor</th>
                <th className="p-4">Top Rekomendasi</th>
                <th className="p-4">Skor</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => {
                const top = item.hasil?.[0];

                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">
                          {item.userName || "User"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.userEmail || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">{item.inputUser?.jenisMotor || "-"}</td>

                    <td className="p-4">{top?.namaKombinasi || "-"}</td>

                    <td className="p-4">
                      {top ? (top.similarityScore * 100).toFixed(2) + "%" : "-"}
                    </td>

                    <td className="p-4">
                      {formatDate(item.createdAt?.seconds)}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:underline"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
