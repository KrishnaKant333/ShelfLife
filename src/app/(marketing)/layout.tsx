import Navbar from "@/components/Navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="scroll-fog min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}