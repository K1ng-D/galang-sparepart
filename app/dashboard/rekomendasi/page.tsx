"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Bike, Calculator, Search } from "lucide-react";

type Kombinasi = {
  id: string;
  namaKombinasi: string;
  jenisMotor: string;
  kapasitasMesin: string;
  tipePenggunaan: string;
  budgetMin: number;
  budgetMax: number;
  piston: string;
  blokMesin: string;
  camshaft: string;
  klep: string;
  ecu: string;
  injektorKarburator: string;
  knalpot: string;
  deskripsi: string;
  fiturText: string;
};

type HasilItem = Kombinasi & {
  similarityScore: number;
};

const initialForm = {
  jenisMotor: "",
  kapasitasMesin: "",
  tipePenggunaan: "",
  budget: "",
  kebutuhan: "",
};

export default function RekomendasiPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [kombinasiData, setKombinasiData] = useState<Kombinasi[]>([]);
  const [userData, setUserData] = useState<{
    uid: string;
    name: string;
    email: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUserData({
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email || "-",
      });
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const getKombinasi = async () => {
      const snapshot = await getDocs(collection(db, "kombinasi"));

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Kombinasi[];

      setKombinasiData(data);
    };

    getKombinasi();
  }, []);

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

  const inputText = useMemo(() => {
    return [
      form.jenisMotor,
      form.kapasitasMesin,
      form.tipePenggunaan,
      form.budget,
      form.kebutuhan,
    ]
      .join(" ")
      .toLowerCase();
  }, [form]);

  const tokenize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  };

  const cosineSimilarityText = (textA: string, textB: string) => {
    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);

    const vocabulary = Array.from(new Set([...tokensA, ...tokensB]));

    const vectorA = vocabulary.map(
      (term) => tokensA.filter((token) => token === term).length,
    );

    const vectorB = vocabulary.map(
      (term) => tokensB.filter((token) => token === term).length,
    );

    const dotProduct = vectorA.reduce(
      (sum, value, index) => sum + value * vectorB[index],
      0,
    );

    const magnitudeA = Math.sqrt(
      vectorA.reduce((sum, value) => sum + value * value, 0),
    );

    const magnitudeB = Math.sqrt(
      vectorB.reduce((sum, value) => sum + value * value, 0),
    );

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userData) {
      alert("User belum login.");
      return;
    }

    if (
      !form.jenisMotor ||
      !form.kapasitasMesin ||
      !form.tipePenggunaan ||
      !form.budget
    ) {
      alert(
        "Jenis motor, kapasitas mesin, tipe penggunaan, dan budget wajib diisi.",
      );
      return;
    }

    setLoading(true);

    try {
      const budgetUser = Number(form.budget || 0);

      const hasil: HasilItem[] = kombinasiData
        .map((item) => {
          const itemText =
            item.fiturText ||
            [
              item.namaKombinasi,
              item.jenisMotor,
              item.kapasitasMesin,
              item.tipePenggunaan,
              item.piston,
              item.blokMesin,
              item.camshaft,
              item.klep,
              item.ecu,
              item.injektorKarburator,
              item.knalpot,
              item.deskripsi,
            ]
              .join(" ")
              .toLowerCase();

          let score = cosineSimilarityText(inputText, itemText);

          const budgetCocok =
            budgetUser >= Number(item.budgetMin || 0) &&
            budgetUser <= Number(item.budgetMax || 0);

          if (budgetCocok) {
            score += 0.15;
          }

          if (
            item.jenisMotor
              ?.toLowerCase()
              .includes(form.jenisMotor.toLowerCase())
          ) {
            score += 0.2;
          }

          if (
            item.tipePenggunaan
              ?.toLowerCase()
              .includes(form.tipePenggunaan.toLowerCase())
          ) {
            score += 0.2;
          }

          return {
            ...item,
            similarityScore: Math.min(score, 1),
          };
        })
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 5);

      const docRef = await addDoc(collection(db, "hasil_rekomendasi"), {
        userId: userData.uid,
        userName: userData.name,
        userEmail: userData.email,
        inputUser: {
          jenisMotor: form.jenisMotor,
          kapasitasMesin: form.kapasitasMesin,
          tipePenggunaan: form.tipePenggunaan,
          budget: budgetUser,
          kebutuhan: form.kebutuhan,
        },
        hasil,
        createdAt: serverTimestamp(),
      });

      router.push(`/dashboard/hasil/${docRef.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses rekomendasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Rekomendasi Sparepart Bore Up
        </h1>
        <p className="mt-2 text-slate-600">
          Isi kebutuhan motor untuk mendapatkan rekomendasi kombinasi sparepart.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Search size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Form Kebutuhan User</h2>
              <p className="text-sm text-slate-500">
                Data ini akan dibandingkan dengan kombinasi sparepart yang ada.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Jenis Motor
              </label>
              <input
                name="jenisMotor"
                value={form.jenisMotor}
                onChange={handleChange}
                placeholder="Contoh: Vario 125"
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
                placeholder="Contoh: 150cc"
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
                <option value="Harian">Harian</option>
                <option value="Balap">Balap</option>
                <option value="Harian & Balap">Harian & Balap</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="Contoh: 3000000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kebutuhan Tambahan
              </label>
              <textarea
                name="kebutuhan"
                value={form.kebutuhan}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: ingin tarikan bawah enak, aman untuk harian, irit, dan tidak terlalu berisik"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                <Calculator size={18} />
                {loading ? "Memproses..." : "Hitung Rekomendasi"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Bike size={24} />
          </div>

          <h2 className="font-bold text-slate-900">Cara Kerja Rekomendasi</h2>

          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
            <p>1. User mengisi kebutuhan motor dan budget.</p>
            <p>2. Sistem mengambil data kombinasi bore up dari database.</p>
            <p>
              3. Sistem menghitung kemiripan menggunakan pendekatan
              Content-Based Filtering.
            </p>
            <p>4. Hasil ditampilkan dalam bentuk ranking rekomendasi.</p>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Total data kombinasi tersedia:
            <span className="ml-1 font-bold text-slate-900">
              {kombinasiData.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
