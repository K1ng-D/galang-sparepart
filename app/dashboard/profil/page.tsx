"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Lock, LogOut, Mail, Save, User } from "lucide-react";

type ProfileData = {
  uid: string;
  name: string;
  email: string;
  role: string;
};

export default function UserProfilPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const data = userSnap.data();

      const profileData = {
        uid: user.uid,
        name: data?.name || user.displayName || "User",
        email: data?.email || user.email || "-",
        role: data?.role || "user",
      };

      setProfile(profileData);
      setName(profileData.name);
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth.currentUser || !profile) return;

    setLoadingProfile(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      await updateDoc(doc(db, "users", profile.uid), {
        name,
      });

      alert("Profil berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui profil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth.currentUser || !auth.currentUser.email) return;

    if (!currentPassword || !newPassword) {
      alert("Password lama dan password baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password baru minimal 6 karakter.");
      return;
    }

    setLoadingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");

      alert("Password berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah password. Pastikan password lama benar.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="p-8">
        <p className="text-slate-600">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profil User</h1>
        <p className="mt-2 text-slate-600">Kelola informasi akun pengguna.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <User size={44} />
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>

            <span className="mt-4 inline-flex rounded-full bg-orange-100 px-4 py-1 text-xs font-bold uppercase text-orange-700">
              {profile.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              Edit Profil
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
                  <User size={18} className="text-slate-500" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full outline-none"
                    placeholder="Masukkan nama"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                  <Mail size={18} />
                  <input
                    value={profile.email}
                    disabled
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Email tidak diubah dari halaman ini.
                </p>
              </div>

              <button
                type="submit"
                disabled={loadingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                <Save size={18} />
                {loadingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              Ubah Password
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password Lama
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
                  <Lock size={18} className="text-slate-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full outline-none"
                    placeholder="Masukkan password lama"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password Baru
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
                  <Lock size={18} className="text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full outline-none"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <Lock size={18} />
                {loadingPassword ? "Memproses..." : "Ubah Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
