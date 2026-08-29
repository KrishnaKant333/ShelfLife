import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsView from "@/components/dashboard/SettingsView";

export default async function BusinessSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <SettingsView user={session.user} />
    </main>
  );
}
