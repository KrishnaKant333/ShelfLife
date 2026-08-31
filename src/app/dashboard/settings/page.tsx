import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsView from "@/components/dashboard/SettingsView";

export default async function ConsumerSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <SettingsView user={{
        ...session.user,
        plan: session.user.plan as any
      }} />
    </main>
  );
}
