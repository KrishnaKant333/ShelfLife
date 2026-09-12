import Navbar from "@/components/Navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark min-h-screen bg-[#0c120e] text-[var(--sl-color-text)]">
      <Navbar />
      {children}
    </div>
  );
}
