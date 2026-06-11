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
import { Boxes, Edit, Plus, Search, Trash2, X } from "lucide-react";

type Sparepart = {
  id: string;
  nama: string;
  kategori: string;
  merk?: string;
  harga?: number;
  spesifikasi?: string;
};

type SelectedSparepart = {
  id: string;
  nama: string;
  kategori: string;
  merk?: string;
  harga?: number;
};

type Kombinasi = {
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

  deskripsi: string;
  fiturText: string;
  createdAt?: unknown;
};

const tipePenggunaanOptions = ["Harian", "Balap", "Harian & Balap"];

const initialForm = {
  namaKombinasi: "",
  jenisMotor: "",
  kapasitasMesin: "",
  tipePenggunaan: "",
  budgetMin: "",
  budgetMax: "",

  pistonId: "",
  blokMesinId: "",
  camshaftId: "",
  fuelSystemId: "",
  knalpotId: "",

  ecuId: "",
  oliId: "",
  kampasKoplingId: "",
  perKoplingId: "",
  throttleBodyId: "",
  busiId: "",
  stangPistonId: "",
  klepId: "",
  perKlepId: "",
  intakeManifoldId: "",
  radiatorId: "",
  injectorId: "",
  crankshaftId: "",
  pistonRingId: "",
  cylinderHeadId: "",
  coilId: "",
  fuelPumpId: "",
  airRadiatorId: "",
  bateraiAkiId: "",

  deskripsi: "",
};

export default function AdminKombinasiPage() {
  const [kombinasi, setKombinasi] = useState<Kombinasi[]>([]);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterPenggunaan, setFilterPenggunaan] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "kombinasi"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Kombinasi[];

      setKombinasi(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "spareparts"), orderBy("nama", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Sparepart[];

      setSpareparts(data);
    });

    return () => unsubscribe();
  }, []);

  const getSparepartByKategori = (kategori: string) => {
    return spareparts.filter((item) => item.kategori === kategori);
  };

  const getSelectedSparepart = (id: string): SelectedSparepart | null => {
    const item = spareparts.find((sparepart) => sparepart.id === id);

    if (!item) return null;

    return {
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      merk: item.merk || "",
      harga: item.harga || 0,
    };
  };

  const renderSparepartSelect = (
    label: string,
    name: keyof typeof initialForm,
    kategori: string,
    placeholder: string,
  ) => {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
        >
          <option value="">{placeholder}</option>
          {getSparepartByKategori(kategori).map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama} {item.merk ? `- ${item.merk}` : ""}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const filteredKombinasi = useMemo(() => {
    return kombinasi.filter((item) => {
      const keyword = search.toLowerCase();

      const sparepartText = [
        item.piston?.nama,
        item.blokMesin?.nama,
        item.camshaft?.nama,
        item.fuelSystem?.nama,
        item.knalpot?.nama,
        item.ecu?.nama,
        item.oli?.nama,
        item.kampasKopling?.nama,
        item.perKopling?.nama,
        item.throttleBody?.nama,
        item.busi?.nama,
        item.stangPiston?.nama,
        item.klep?.nama,
        item.perKlep?.nama,
        item.intakeManifold?.nama,
        item.radiator?.nama,
        item.injector?.nama,
        item.crankshaft?.nama,
        item.pistonRing?.nama,
        item.cylinderHead?.nama,
        item.coil?.nama,
        item.fuelPump?.nama,
        item.airRadiator?.nama,
        item.bateraiAki?.nama,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch =
        item.namaKombinasi?.toLowerCase().includes(keyword) ||
        item.jenisMotor?.toLowerCase().includes(keyword) ||
        item.kapasitasMesin?.toLowerCase().includes(keyword) ||
        item.tipePenggunaan?.toLowerCase().includes(keyword) ||
        sparepartText.includes(keyword);

      const matchPenggunaan = filterPenggunaan
        ? item.tipePenggunaan === filterPenggunaan
        : true;

      return matchSearch && matchPenggunaan;
    });
  }, [kombinasi, search, filterPenggunaan]);

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

  const generateFiturText = () => {
    const selectedParts = [
      getSelectedSparepart(form.pistonId),
      getSelectedSparepart(form.blokMesinId),
      getSelectedSparepart(form.camshaftId),
      getSelectedSparepart(form.fuelSystemId),
      getSelectedSparepart(form.knalpotId),
      getSelectedSparepart(form.ecuId),
      getSelectedSparepart(form.oliId),
      getSelectedSparepart(form.kampasKoplingId),
      getSelectedSparepart(form.perKoplingId),
      getSelectedSparepart(form.throttleBodyId),
      getSelectedSparepart(form.busiId),
      getSelectedSparepart(form.stangPistonId),
      getSelectedSparepart(form.klepId),
      getSelectedSparepart(form.perKlepId),
      getSelectedSparepart(form.intakeManifoldId),
      getSelectedSparepart(form.radiatorId),
      getSelectedSparepart(form.injectorId),
      getSelectedSparepart(form.crankshaftId),
      getSelectedSparepart(form.pistonRingId),
      getSelectedSparepart(form.cylinderHeadId),
      getSelectedSparepart(form.coilId),
      getSelectedSparepart(form.fuelPumpId),
      getSelectedSparepart(form.airRadiatorId),
      getSelectedSparepart(form.bateraiAkiId),
    ];

    return [
      form.namaKombinasi,
      form.jenisMotor,
      form.kapasitasMesin,
      form.tipePenggunaan,
      ...selectedParts.flatMap((item) => [item?.nama, item?.merk]),
      form.deskripsi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.namaKombinasi ||
      !form.jenisMotor ||
      !form.kapasitasMesin ||
      !form.tipePenggunaan
    ) {
      alert(
        "Nama kombinasi, jenis motor, kapasitas mesin, dan tipe penggunaan wajib diisi.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        namaKombinasi: form.namaKombinasi,
        jenisMotor: form.jenisMotor,
        kapasitasMesin: form.kapasitasMesin,
        tipePenggunaan: form.tipePenggunaan,
        budgetMin: Number(form.budgetMin || 0),
        budgetMax: Number(form.budgetMax || 0),

        piston: getSelectedSparepart(form.pistonId),
        blokMesin: getSelectedSparepart(form.blokMesinId),
        camshaft: getSelectedSparepart(form.camshaftId),
        fuelSystem: getSelectedSparepart(form.fuelSystemId),
        knalpot: getSelectedSparepart(form.knalpotId),

        ecu: getSelectedSparepart(form.ecuId),
        oli: getSelectedSparepart(form.oliId),
        kampasKopling: getSelectedSparepart(form.kampasKoplingId),
        perKopling: getSelectedSparepart(form.perKoplingId),
        throttleBody: getSelectedSparepart(form.throttleBodyId),
        busi: getSelectedSparepart(form.busiId),
        stangPiston: getSelectedSparepart(form.stangPistonId),
        klep: getSelectedSparepart(form.klepId),
        perKlep: getSelectedSparepart(form.perKlepId),
        intakeManifold: getSelectedSparepart(form.intakeManifoldId),
        radiator: getSelectedSparepart(form.radiatorId),
        injector: getSelectedSparepart(form.injectorId),
        crankshaft: getSelectedSparepart(form.crankshaftId),
        pistonRing: getSelectedSparepart(form.pistonRingId),
        cylinderHead: getSelectedSparepart(form.cylinderHeadId),
        coil: getSelectedSparepart(form.coilId),
        fuelPump: getSelectedSparepart(form.fuelPumpId),
        airRadiator: getSelectedSparepart(form.airRadiatorId),
        bateraiAki: getSelectedSparepart(form.bateraiAkiId),

        deskripsi: form.deskripsi,
        fiturText: generateFiturText(),
      };

      if (editId) {
        await updateDoc(doc(db, "kombinasi", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "kombinasi"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data kombinasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Kombinasi) => {
    setEditId(item.id);
    setShowForm(true);

    setForm({
      namaKombinasi: item.namaKombinasi || "",
      jenisMotor: item.jenisMotor || "",
      kapasitasMesin: item.kapasitasMesin || "",
      tipePenggunaan: item.tipePenggunaan || "",
      budgetMin: String(item.budgetMin || ""),
      budgetMax: String(item.budgetMax || ""),

      pistonId: item.piston?.id || "",
      blokMesinId: item.blokMesin?.id || "",
      camshaftId: item.camshaft?.id || "",
      fuelSystemId: item.fuelSystem?.id || "",
      knalpotId: item.knalpot?.id || "",

      ecuId: item.ecu?.id || "",
      oliId: item.oli?.id || "",
      kampasKoplingId: item.kampasKopling?.id || "",
      perKoplingId: item.perKopling?.id || "",
      throttleBodyId: item.throttleBody?.id || "",
      busiId: item.busi?.id || "",
      stangPistonId: item.stangPiston?.id || "",
      klepId: item.klep?.id || "",
      perKlepId: item.perKlep?.id || "",
      intakeManifoldId: item.intakeManifold?.id || "",
      radiatorId: item.radiator?.id || "",
      injectorId: item.injector?.id || "",
      crankshaftId: item.crankshaft?.id || "",
      pistonRingId: item.pistonRing?.id || "",
      cylinderHeadId: item.cylinderHead?.id || "",
      coilId: item.coil?.id || "",
      fuelPumpId: item.fuelPump?.id || "",
      airRadiatorId: item.airRadiator?.id || "",
      bateraiAkiId: item.bateraiAki?.id || "",

      deskripsi: item.deskripsi || "",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus data kombinasi ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "kombinasi", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data kombinasi.");
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const totalHarga = [
    form.pistonId,
    form.blokMesinId,
    form.camshaftId,
    form.fuelSystemId,
    form.knalpotId,
    form.ecuId,
    form.oliId,
    form.kampasKoplingId,
    form.perKoplingId,
    form.throttleBodyId,
    form.busiId,
    form.stangPistonId,
    form.klepId,
    form.perKlepId,
    form.intakeManifoldId,
    form.radiatorId,
    form.injectorId,
    form.crankshaftId,
    form.pistonRingId,
    form.cylinderHeadId,
    form.coilId,
    form.fuelPumpId,
    form.airRadiatorId,
    form.bateraiAkiId,
  ].reduce((total, id) => total + (getSelectedSparepart(id)?.harga || 0), 0);

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Data Kombinasi Bore Up
          </h1>
          <p className="mt-2 text-slate-600">
            Kelola kombinasi sparepart berdasarkan data sparepart yang sudah
            dimasukkan.
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
          Tambah Kombinasi
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {editId ? "Edit Kombinasi" : "Tambah Kombinasi"}
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
                Nama Kombinasi
              </label>
              <input
                name="namaKombinasi"
                value={form.namaKombinasi}
                onChange={handleChange}
                placeholder="Contoh: Paket Bore Up Harian 150cc"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Jenis Motor
              </label>
              <input
                name="jenisMotor"
                value={form.jenisMotor}
                onChange={handleChange}
                placeholder="Contoh: Vario 125, Beat, Aerox"
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
                {tipePenggunaanOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Budget Minimum
              </label>
              <input
                type="number"
                name="budgetMin"
                value={form.budgetMin}
                onChange={handleChange}
                placeholder="Contoh: 2500000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Budget Maksimum
              </label>
              <input
                type="number"
                name="budgetMax"
                value={form.budgetMax}
                onChange={handleChange}
                placeholder="Contoh: 5000000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            {renderSparepartSelect(
              "Piston",
              "pistonId",
              "Piston",
              "Pilih piston",
            )}
            {renderSparepartSelect(
              "Blok Mesin",
              "blokMesinId",
              "Blok Mesin",
              "Pilih blok mesin",
            )}
            {renderSparepartSelect(
              "Camshaft",
              "camshaftId",
              "Camshaft",
              "Pilih camshaft",
            )}
            {renderSparepartSelect(
              "Sistem Bahan Bakar",
              "fuelSystemId",
              "Sistem Bahan Bakar",
              "Pilih sistem bahan bakar",
            )}
            {renderSparepartSelect(
              "Knalpot",
              "knalpotId",
              "Knalpot",
              "Pilih knalpot",
            )}

            {renderSparepartSelect("Ecu", "ecuId", "Ecu", "Pilih ecu")}
            {renderSparepartSelect("Oli", "oliId", "Oli", "Pilih oli")}
            {renderSparepartSelect(
              "Kampas Kopling",
              "kampasKoplingId",
              "Kampas Kopling",
              "Pilih kampas kopling",
            )}
            {renderSparepartSelect(
              "Per Kopling",
              "perKoplingId",
              "Per Kopling",
              "Pilih per kopling",
            )}
            {renderSparepartSelect(
              "Throttle Body",
              "throttleBodyId",
              "Throttle Body",
              "Pilih throttle body",
            )}
            {renderSparepartSelect("Busi", "busiId", "Busi", "Pilih busi")}
            {renderSparepartSelect(
              "Stang Piston",
              "stangPistonId",
              "Stang Piston",
              "Pilih stang piston",
            )}
            {renderSparepartSelect("Klep", "klepId", "Klep", "Pilih klep")}
            {renderSparepartSelect(
              "Per Klep",
              "perKlepId",
              "Per Klep",
              "Pilih per klep",
            )}
            {renderSparepartSelect(
              "Intake Manifold",
              "intakeManifoldId",
              "Intake Manifold",
              "Pilih intake manifold",
            )}
            {renderSparepartSelect(
              "Radiator",
              "radiatorId",
              "Radiator",
              "Pilih radiator",
            )}
            {renderSparepartSelect(
              "Injector",
              "injectorId",
              "Injector",
              "Pilih injector",
            )}
            {renderSparepartSelect(
              "Crankshaft (Kruk As)",
              "crankshaftId",
              "Crankshaft (Kruk As)",
              "Pilih crankshaft",
            )}
            {renderSparepartSelect(
              "Piston Ring",
              "pistonRingId",
              "Piston Ring",
              "Pilih piston ring",
            )}
            {renderSparepartSelect(
              "Cylinder Head",
              "cylinderHeadId",
              "Cylinder Head",
              "Pilih cylinder head",
            )}
            {renderSparepartSelect("Coil", "coilId", "Coil", "Pilih coil")}
            {renderSparepartSelect(
              "Fuel Pump",
              "fuelPumpId",
              "Fuel Pump",
              "Pilih fuel pump",
            )}
            {renderSparepartSelect(
              "Air Radiator",
              "airRadiatorId",
              "Air Radiator",
              "Pilih air radiator",
            )}
            {renderSparepartSelect(
              "Baterai/Aki",
              "bateraiAkiId",
              "Baterai/Aki",
              "Pilih baterai/aki",
            )}

            <div className="rounded-xl bg-orange-50 p-4 md:col-span-2">
              <p className="text-sm text-slate-600">Estimasi total harga:</p>
              <p className="mt-1 text-xl font-bold text-orange-700">
                {formatRupiah(totalHarga)}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Deskripsi Kombinasi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: Cocok untuk harian, tarikan bawah responsif, aman untuk penggunaan harian."
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
              placeholder="Cari kombinasi, motor, atau sparepart..."
              className="w-full outline-none"
            />
          </div>

          <select
            value={filterPenggunaan}
            onChange={(e) => setFilterPenggunaan(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="">Semua Tipe Penggunaan</option>
            {tipePenggunaanOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Daftar Kombinasi Bore Up</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total data: {filteredKombinasi.length}
          </p>
        </div>

        {filteredKombinasi.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Boxes size={32} />
            </div>
            <h3 className="font-bold text-slate-900">
              Belum ada data kombinasi
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Tambahkan data kombinasi bore up terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-5 py-4">Kombinasi</th>
                  <th className="px-5 py-4">Motor</th>
                  <th className="px-5 py-4">Kapasitas</th>
                  <th className="px-5 py-4">Penggunaan</th>
                  <th className="px-5 py-4">Budget</th>
                  <th className="px-5 py-4">Sparepart</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredKombinasi.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.namaKombinasi}
                      </p>
                      <p className="line-clamp-2 max-w-[280px] text-xs leading-5 text-slate-500">
                        {item.deskripsi || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {item.jenisMotor}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {item.kapasitasMesin}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        {item.tipePenggunaan}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatRupiah(item.budgetMin)} -{" "}
                      {formatRupiah(item.budgetMax)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="max-w-[460px] space-y-1 text-xs text-slate-600">
                        <p>Piston: {item.piston?.nama || "-"}</p>
                        <p>Blok: {item.blokMesin?.nama || "-"}</p>
                        <p>Camshaft: {item.camshaft?.nama || "-"}</p>
                        <p>Bahan Bakar: {item.fuelSystem?.nama || "-"}</p>
                        <p>Knalpot: {item.knalpot?.nama || "-"}</p>
                        <p>Ecu: {item.ecu?.nama || "-"}</p>
                        <p>Oli: {item.oli?.nama || "-"}</p>
                        <p>Kampas Kopling: {item.kampasKopling?.nama || "-"}</p>
                        <p>Per Kopling: {item.perKopling?.nama || "-"}</p>
                        <p>Throttle Body: {item.throttleBody?.nama || "-"}</p>
                        <p>Busi: {item.busi?.nama || "-"}</p>
                        <p>Stang Piston: {item.stangPiston?.nama || "-"}</p>
                        <p>Klep: {item.klep?.nama || "-"}</p>
                        <p>Per Klep: {item.perKlep?.nama || "-"}</p>
                        <p>
                          Intake Manifold: {item.intakeManifold?.nama || "-"}
                        </p>
                        <p>Radiator: {item.radiator?.nama || "-"}</p>
                        <p>Injector: {item.injector?.nama || "-"}</p>
                        <p>Crankshaft: {item.crankshaft?.nama || "-"}</p>
                        <p>Piston Ring: {item.pistonRing?.nama || "-"}</p>
                        <p>Cylinder Head: {item.cylinderHead?.nama || "-"}</p>
                        <p>Coil: {item.coil?.nama || "-"}</p>
                        <p>Fuel Pump: {item.fuelPump?.nama || "-"}</p>
                        <p>Air Radiator: {item.airRadiator?.nama || "-"}</p>
                        <p>Baterai/Aki: {item.bateraiAki?.nama || "-"}</p>
                      </div>
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
