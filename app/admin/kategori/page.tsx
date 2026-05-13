"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Plus, Search, Tags, Trash2, X } from "lucide-react";

type Kategori = {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  status: "Aktif" | "Nonaktif";
  createdAt?: unknown;
};

const initialForm = {
  nama: "",
  kode: "",
  deskripsi: "",
  status: "Aktif" as "Aktif" | "Nonaktif",
};

export default function AdminKategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "kategori"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Kategori[];

      setKategori(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredKategori = useMemo(() => {
    return kategori.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.nama.toLowerCase().includes(keyword) ||
        item.kode.toLowerCase().includes(keyword) ||
        item.deskripsi.toLowerCase().includes(keyword);

      const matchStatus = filterStatus ? item.status === filterStatus : true;

      return matchSearch && matchStatus;
    });
  }, [kategori, search, filterStatus]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const generateKode = (nama: string) => {
    return nama
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "nama") {
      setForm({
        ...form,
        nama: value,
        kode: editId ? form.kode : generateKode(value),
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.nama || !form.kode) {
      alert("Nama kategori dan kode wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama: form.nama,
        kode: form.kode,
        deskripsi: form.deskripsi,
        status: form.status,
      };

      if (editId) {
        await updateDoc(doc(db, "kategori", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "kategori"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data kategori.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Kategori) => {
    setEditId(item.id);
    setShowForm(true);

    setForm({
      nama: item.nama || "",
      kode: item.kode || "",
      deskripsi: item.deskripsi || "",
      status: item.status || "Aktif",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus kategori ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "kategori", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus kategori.");
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kategori Sparepart
          </h1>
          <p className="mt-2 text-slate-600">
            Kelola kategori komponen bore up seperti piston, blok mesin,
            camshaft, klep, ECU/CDI, injektor, karburator, dan knalpot.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm(initialForm);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editId ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <button
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nama Kategori
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Contoh: Piston"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kode Kategori
              </label>
              <input
                name="kode"
                value={form.kode}
                onChange={handleChange}
                placeholder="Contoh: PISTON"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: Komponen piston untuk meningkatkan kapasitas ruang bakar pada proses bore up."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {loading
                  ? "Menyimpan..."
                  : editId
                    ? "Update Data"
                    : "Simpan Data"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
            <Search size={18} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kategori, kode, atau deskripsi..."
              className="w-full outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Daftar Kategori</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total data: {filteredKategori.length}
          </p>
        </div>

        {filteredKategori.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Tags size={32} />
            </div>
            <h3 className="font-bold text-slate-900">
              Belum ada data kategori
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Tambahkan kategori sparepart terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Nama Kategori</th>
                  <th className="px-5 py-4">Kode</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredKategori.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.nama}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item.kode}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="line-clamp-2 max-w-[420px] text-slate-600">
                        {item.deskripsi || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
