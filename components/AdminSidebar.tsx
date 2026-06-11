"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Bike,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const menus = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Data Sparepart",
    href: "/admin/sparepart",
    icon: Package,
  },
  {
    name: "Data Kombinasi",
    href: "/admin/kombinasi",
    icon: Boxes,
  },
  {
    name: "Kategori",
    href: "/admin/kategori",
    icon: Tags,
  },
  {
    name: "Hasil Rekomendasi",
    href: "/admin/hasil-rekomendasi",
    icon: ClipboardList,
  },
  {
    name: "Data User",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
          <Bike size={26} />
        </div>

        <div>
          <h1 className="text-lg font-bold">BoreUp Admin</h1>
          <p className="text-xs text-slate-400">Sparepart Recommendation</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
