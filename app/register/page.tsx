"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Bike, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(result.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Gagal membuat akun. Periksa email atau password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400">
            <Bike size={34} />
          </div>

          <h1 className="text-2xl font-bold text-white">Daftar Akun</h1>
          <p className="mt-2 text-sm text-slate-400">
            Buat akun user untuk menggunakan sistem rekomendasi.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nama Lengkap
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300">
              <User size={18} />
              <input
                type="text"
                placeholder="Masukkan nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-orange-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
