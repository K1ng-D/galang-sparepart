"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Trophy } from "lucide-react";

type SelectedSparepart = {
  id: string;
  nama: string;
  kategori: string;
  merk?: string;
  harga?: number;
};

type HasilItem = {
  id: string;
  namaKombinasi: string;
  jenisMotor: string;
  kapasitasMesin: string;
  tipePenggunaan: string;
  budgetMin: number;
  budgetMax: number;

  piston?: SelectedSparepart | null;
  blokMesin?: SelectedSparepart | null;
  camshaft?: SelectedSparepart | null;
  fuelSystem?: SelectedSparepart | null;
  knalpot?: SelectedSparepart | null;

  ecu?: SelectedSparepart | null;
  oli?: SelectedSparepart | null;
  kampasKopling?: SelectedSparepart | null;
  perKopling?: SelectedSparepart | null;
  throttleBody?: SelectedSparepart | null;
  busi?: SelectedSparepart | null;
  stangPiston?: SelectedSparepart | null;
  klep?: SelectedSparepart | null;
  perKlep?: SelectedSparepart | null;
  intakeManifold?: SelectedSparepart | null;
  radiator?: SelectedSparepart | null;
  injector?: SelectedSparepart | null;
  crankshaft?: SelectedSparepart | null;
  pistonRing?: SelectedSparepart | null;
  cylinderHead?: SelectedSparepart | null;
  coil?: SelectedSparepart | null;
  fuelPump?: SelectedSparepart | null;
  airRadiator?: SelectedSparepart | null;
  bateraiAki?: SelectedSparepart | null;

  deskripsi?: string;
  similarityScore: number;
};

type HasilRekomendasi = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  inputUser: {
    jenisMotor: string;
    kapasitasMesin: string;
    tipePenggunaan: string;
    budget: number;
    kebutuhan: string;
  };
  hasil: HasilItem[];
  createdAt?: {
    seconds: number;
  };
};

export default function DetailHasilPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HasilRekomendasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetail = async () => {
      try {
        const docRef = doc(db, "hasil_rekomendasi", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as HasilRekomendasi);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getDetail();
  }, [id]);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderPartCard = (label: string, part?: SelectedSparepart | null) => {
    return (
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-slate-500">{label}</p>
        <p className="font-semibold">{part?.nama || "-"}</p>
        {part?.merk && (
          <p className="mt-1 text-xs text-slate-500">Merk: {part.merk}</p>
        )}
        {part?.harga ? (
          <p className="mt-1 text-xs font-semibold text-orange-600">
            {formatRupiah(part.harga)}
          </p>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Memuat data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Data tidak ditemukan
        </h1>

        <Link
          href="/dashboard/rekomendasi"
          className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white"
        >
          Buat Rekomendasi Baru
        </Link>
      </div>
    );
  }

  const topResult = data.hasil?.[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
        >
          <ArrowLeft size={17} />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          Detail Hasil Rekomendasi
        </h1>

        <p className="mt-2 text-slate-600">
          Berikut hasil rekomendasi kombinasi sparepart bore up motor.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-900">Input User</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Jenis Motor</p>
            <p className="font-semibold text-slate-900">
              {data.inputUser.jenisMotor}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Kapasitas Mesin</p>
            <p className="font-semibold text-slate-900">
              {data.inputUser.kapasitasMesin}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Tipe Penggunaan</p>
            <p className="font-semibold text-slate-900">
              {data.inputUser.tipePenggunaan}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Budget</p>
            <p className="font-semibold text-slate-900">
              {formatRupiah(data.inputUser.budget)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
            <p className="text-sm text-slate-500">Kebutuhan</p>
            <p className="font-semibold text-slate-900">
              {data.inputUser.kebutuhan || "-"}
            </p>
          </div>
        </div>
      </div>

      {topResult && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <Trophy className="text-orange-600" />
            <h2 className="font-bold text-slate-900">Rekomendasi Terbaik</h2>
          </div>

          <h3 className="text-xl font-bold text-orange-700">
            {topResult.namaKombinasi}
          </h3>

          <p className="mt-2 text-slate-700">
            Skor similarity:{" "}
            <span className="font-bold">
              {(topResult.similarityScore * 100).toFixed(2)}%
            </span>
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Ranking Rekomendasi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Diurutkan berdasarkan skor similarity tertinggi.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {data.hasil && data.hasil.length > 0 ? (
            data.hasil.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      Ranking #{index + 1}
                    </span>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                      {item.namaKombinasi}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {item.deskripsi || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                    <p className="text-xs text-slate-500">Similarity</p>
                    <p className="text-xl font-bold text-orange-600">
                      {(item.similarityScore * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Jenis Motor</p>
                    <p className="font-semibold">{item.jenisMotor}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Kapasitas</p>
                    <p className="font-semibold">{item.kapasitasMesin}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Penggunaan</p>
                    <p className="font-semibold">{item.tipePenggunaan}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Budget</p>
                    <p className="font-semibold">
                      {formatRupiah(item.budgetMin)} -{" "}
                      {formatRupiah(item.budgetMax)}
                    </p>
                  </div>
                </div>

                <h4 className="mb-3 font-bold text-slate-900">
                  Detail Sparepart
                </h4>

                <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                  {renderPartCard("Piston", item.piston)}
                  {renderPartCard("Blok Mesin", item.blokMesin)}
                  {renderPartCard("Camshaft", item.camshaft)}
                  {renderPartCard("Sistem Bahan Bakar", item.fuelSystem)}
                  {renderPartCard("Knalpot", item.knalpot)}

                  {renderPartCard("Ecu", item.ecu)}
                  {renderPartCard("Oli", item.oli)}
                  {renderPartCard("Kampas Kopling", item.kampasKopling)}
                  {renderPartCard("Per Kopling", item.perKopling)}
                  {renderPartCard("Throttle Body", item.throttleBody)}
                  {renderPartCard("Busi", item.busi)}
                  {renderPartCard("Stang Piston", item.stangPiston)}
                  {renderPartCard("Klep", item.klep)}
                  {renderPartCard("Per Klep", item.perKlep)}
                  {renderPartCard("Intake Manifold", item.intakeManifold)}
                  {renderPartCard("Radiator", item.radiator)}
                  {renderPartCard("Injector", item.injector)}
                  {renderPartCard("Crankshaft / Kruk As", item.crankshaft)}
                  {renderPartCard("Piston Ring", item.pistonRing)}
                  {renderPartCard("Cylinder Head", item.cylinderHead)}
                  {renderPartCard("Coil", item.coil)}
                  {renderPartCard("Fuel Pump", item.fuelPump)}
                  {renderPartCard("Air Radiator", item.airRadiator)}
                  {renderPartCard("Baterai / Aki", item.bateraiAki)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Tidak ada hasil rekomendasi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
