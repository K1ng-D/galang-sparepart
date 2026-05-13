import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="ml-72 min-h-screen p-8">{children}</main>
    </div>
  );
}
