"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Search, Trash2, Users, X } from "lucide-react";

type UserRole = "admin" | "user";

type AppUser = {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: {
    seconds: number;
  };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole>("user");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as AppUser[];

      setUsers(result);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.role?.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const handleOpenEdit = (user: AppUser) => {
    setSelectedUser(user);
    setRole(user.role || "user");
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        role,
      });

      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert("Gagal mengubah role user.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus data user ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data user.");
    }
  };

  const formatDate = (seconds?: number) => {
    if (!seconds) return "-";

    return new Date(seconds * 1000).toLocaleString("id-ID");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Data User</h1>
        <p className="mt-2 text-slate-600">
          Kelola data pengguna yang terdaftar pada sistem rekomendasi sparepart
          bore up.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Daftar User</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total data: {filteredUsers.length}
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Users size={32} />
            </div>
            <h3 className="font-bold text-slate-900">Belum ada user</h3>
            <p className="mt-2 text-sm text-slate-500">
              Data user yang mendaftar akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Tanggal Daftar</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.email || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.role === "admin"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.role}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.createdAt?.seconds)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Ubah Role User
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {selectedUser.name}
              </p>
              <p className="text-sm text-slate-500">{selectedUser.email}</p>
            </div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpdateRole}
                className="flex-1 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Simpan
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
