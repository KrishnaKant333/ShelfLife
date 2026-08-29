import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  if (session.user.accountType !== "consumer") {
    redirect("/business/dashboard");
  }

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  );
}