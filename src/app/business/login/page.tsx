import AuthLayout from "@/components/auth/AuthLayout";
import BusinessLoginForm from "@/components/auth/BusinessLoginForm";

export default function BusinessLoginPage() {
  return (
    <AuthLayout
      accountType="business"
      flowType="login"
      badgeText="Commercial Operations"
      title="Welcome back"
      subtitle="Sign in to your commercial inventory and waste reduction workspace."
      editorialHeadline="Precision inventory and lower waste for food operations."
      editorialDescription="Manage FIFO batch priorities, monitor cost exposure, and streamline replenishment across your culinary teams."
      highlights={[
        {
          title: "FIFO Batch Rotation",
          desc: "Ensure older inventory is prioritized first to protect operating margins.",
        },
        {
          title: "Waste Analytics & Cost Exposure",
          desc: "Live visibility into shrinkage value, expiring stock, and turnover velocity.",
        },
        {
          title: "Invoice & Bulk CSV Import",
          desc: "Quickly ingest vendor orders and keep active inventory synchronized.",
        },
      ]}
      switchPrompt={{
        text: "Looking for your personal household pantry?",
        linkText: "Consumer Login",
        href: "/consumer/login",
      }}
    >
      <BusinessLoginForm />
    </AuthLayout>
  );
}