import UserNavbar from "@/components/UserNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <UserNavbar />
      <main>{children}</main>
    </div>
  );
}
