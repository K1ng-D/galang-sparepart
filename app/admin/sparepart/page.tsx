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
import { CldUploadWidget } from "next-cloudinary";
import {
  Edit,
  ImagePlus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Sparepart = {
  id: string;
  nama: string;
  kategori: string;
  merk: string;
  spesifikasi: string;
  kapasitasMesin: string;
  tipePenggunaan: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambarUrl: string;
  createdAt?: unknown;
};

type Kategori = {
  id: string;
  nama: string;
  kode: string;
  status: "Aktif" | "Nonaktif";
};

const penggunaanOptions = ["Harian", "Balap", "Harian & Balap"];

const initialForm = {
  nama: "",
  kategori: "",
  merk: "",
  spesifikasi: "",
  kapasitasMesin: "",
  tipePenggunaan: "",
  harga: "",
  stok: "",
  deskripsi: "",
  gambarUrl: "",
};

export default function AdminSparepartPage() {
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [kategoriOptions, setKategoriOptions] = useState<Kategori[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "spareparts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Sparepart[];

      setSpareparts(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "kategori"), orderBy("nama", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Kategori[];

      const kategoriAktif = data.filter((item) => item.status === "Aktif");

      setKategoriOptions(kategoriAktif);
    });

    return () => unsubscribe();
  }, []);

  const filteredSpareparts = useMemo(() => {
    return spareparts.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.nama.toLowerCase().includes(keyword) ||
        item.merk.toLowerCase().includes(keyword) ||
        item.kategori.toLowerCase().includes(keyword) ||
        item.spesifikasi.toLowerCase().includes(keyword);

      const matchKategori = filterKategori
        ? item.kategori === filterKategori
        : true;

      return matchSearch && matchKategori;
    });
  }, [spareparts, search, filterKategori]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.nama || !form.kategori || !form.merk) {
      alert("Nama sparepart, kategori, dan merk wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama: form.nama,
        kategori: form.kategori,
        merk: form.merk,
        spesifikasi: form.spesifikasi,
        kapasitasMesin: form.kapasitasMesin,
        tipePenggunaan: form.tipePenggunaan,
        harga: Number(form.harga || 0),
        stok: Number(form.stok || 0),
        deskripsi: form.deskripsi,
        gambarUrl: form.gambarUrl,
      };

      if (editId) {
        await updateDoc(doc(db, "spareparts", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "spareparts"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data sparepart.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Sparepart) => {
    setEditId(item.id);
    setShowForm(true);

    setForm({
      nama: item.nama || "",
      kategori: item.kategori || "",
      merk: item.merk || "",
      spesifikasi: item.spesifikasi || "",
      kapasitasMesin: item.kapasitasMesin || "",
      tipePenggunaan: item.tipePenggunaan || "",
      harga: String(item.harga || ""),
      stok: String(item.stok || ""),
      deskripsi: item.deskripsi || "",
      gambarUrl: item.gambarUrl || "",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus data sparepart ini?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "spareparts", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data sparepart.");
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Sparepart</h1>
          <p className="mt-2 text-slate-600">
            Kelola data sparepart bore up motor seperti piston, blok mesin,
            camshaft, ECU, injektor, karburator, dan knalpot.
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
          Tambah Sparepart
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editId ? "Edit Sparepart" : "Tambah Sparepart"}
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
                Nama Sparepart
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Contoh: Piston Uma Racing 58mm"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="">Pilih kategori</option>
                {kategoriOptions.map((item) => (
                  <option key={item.id} value={item.nama}>
                    {item.nama}
                  </option>
                ))}
              </select>

              {kategoriOptions.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  Belum ada kategori aktif. Tambahkan kategori terlebih dahulu.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Merk
              </label>
              <input
                name="merk"
                value={form.merk}
                onChange={handleChange}
                placeholder="Contoh: Uma Racing"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kapasitas Mesin
              </label>
              <input
                name="kapasitasMesin"
                value={form.kapasitasMesin}
                onChange={handleChange}
                placeholder="Contoh: 150cc - 180cc"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tipe Penggunaan
              </label>
              <select
                name="tipePenggunaan"
                value={form.tipePenggunaan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="">Pilih tipe penggunaan</option>
                {penggunaanOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Harga
              </label>
              <input
                type="number"
                name="harga"
                value={form.harga}
                onChange={handleChange}
                placeholder="Contoh: 750000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stok
              </label>
              <input
                type="number"
                name="stok"
                value={form.stok}
                onChange={handleChange}
                placeholder="Contoh: 10"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gambar Sparepart
              </label>

              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  setForm((prev) => ({
                    ...prev,
                    gambarUrl: result.info.secure_url,
                  }));
                }}
              >
                {({ open }: { open: () => void }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-600 transition hover:border-orange-500 hover:text-orange-600"
                  >
                    <ImagePlus size={18} />
                    Upload Gambar
                  </button>
                )}
              </CldUploadWidget>

              {form.gambarUrl && (
                <img
                  src={form.gambarUrl}
                  alt="Preview sparepart"
                  className="mt-3 h-24 w-24 rounded-xl object-cover"
                />
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Spesifikasi
              </label>
              <textarea
                name="spesifikasi"
                value={form.spesifikasi}
                onChange={handleChange}
                placeholder="Contoh: diameter 58mm, bahan forged, cocok untuk bore up harian"
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="Masukkan deskripsi sparepart"
                rows={4}
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
              placeholder="Cari nama, merk, kategori, atau spesifikasi..."
              className="w-full outline-none"
            />
          </div>

          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map((item) => (
              <option key={item.id} value={item.nama}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Daftar Sparepart</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total data: {filteredSpareparts.length}
          </p>
        </div>

        {filteredSpareparts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Package size={32} />
            </div>
            <h3 className="font-bold text-slate-900">
              Belum ada data sparepart
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Tambahkan data sparepart terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Sparepart</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Merk</th>
                  <th className="px-5 py-4">Kapasitas</th>
                  <th className="px-5 py-4">Penggunaan</th>
                  <th className="px-5 py-4">Harga</th>
                  <th className="px-5 py-4">Stok</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredSpareparts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.gambarUrl ? (
                          <img
                            src={item.gambarUrl}
                            alt={item.nama}
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <Package size={22} />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.nama}
                          </p>
                          <p className="line-clamp-1 max-w-[260px] text-xs text-slate-500">
                            {item.spesifikasi || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {item.kategori}
                    </td>

                    <td className="px-5 py-4 text-slate-700">{item.merk}</td>

                    <td className="px-5 py-4 text-slate-700">
                      {item.kapasitasMesin || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        {item.tipePenggunaan || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatRupiah(item.harga)}
                    </td>

                    <td className="px-5 py-4 text-slate-700">{item.stok}</td>

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
