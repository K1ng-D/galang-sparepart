"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Bike, ClipboardList, Home, LogOut, Search, User } from "lucide-react";
import { auth } from "@/lib/firebase";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Rekomendasi",
    href: "/dashboard/rekomendasi",
    icon: Search,
  },
  {
    name: "Riwayat",
    href: "/dashboard/hasil",
    icon: ClipboardList,
  },
  {
    name: "Profil",
    href: "/dashboard/profil",
    icon: User,
  },
];

export default function UserNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <Bike size={24} />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900">BoreUp Motor</h1>
            <p className="text-xs text-slate-500">Sparepart Recommendation</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active =
              pathname === menu.href ||
              (menu.href !== "/dashboard" && pathname.startsWith(menu.href));

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={17} />
                {menu.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 md:flex"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      <div className="border-t border-slate-100 px-4 pb-3 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active =
              pathname === menu.href ||
              (menu.href !== "/dashboard" && pathname.startsWith(menu.href));

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                <span className="mt-1">{menu.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
