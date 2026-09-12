import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import SettingsView from "@/components/dashboard/SettingsView";

export default async function BusinessSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const business = session.user.businessId
    ? await db.orm.public.Business.first({
        id: Number(session.user.businessId),
      })
    : null;

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">
      <SettingsView
        user={{
          ...session.user,
          plan: session.user.plan as any,
        }}
        business={
          business
            ? {
                name: business.name,
                industry: business.industry,
              }
            : null
        }
      />
    </main>
  );
}
