import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[var(--shelf-cream)] lg:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}