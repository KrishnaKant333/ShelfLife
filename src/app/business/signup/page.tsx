import AuthLayout from "@/components/auth/AuthLayout";
import BusinessSignupForm from "@/components/auth/BusinessSignupForm";

export default function BusinessSignupPage() {
  return (
    <AuthLayout
      accountType="business"
      flowType="signup"
      badgeText="Commercial Operations"
      title="Set up your business"
      subtitle="Configure your commercial food inventory and waste control workspace."
      editorialHeadline="Run smarter, lower-waste commercial food operations."
      editorialDescription="Join ShelfLife for Business to optimize inventory turnover, monitor stock age, prevent costly food shrinkage, and protect culinary margins."
      highlights={[
        {
          title: "FIFO Batch Prioritization",
          desc: "Automatic queue ranking based on receiving dates and expiration windows.",
        },
        {
          title: "Shrinkage & Cost Audits",
          desc: "Actionable financial tracking of waste prevention and active inventory value.",
        },
        {
          title: "Automated Invoice Ingestion",
          desc: "Ingest vendor receipts and bulk supplier records in seconds.",
        },
      ]}
      switchPrompt={{
        text: "Looking for personal household tracking?",
        linkText: "Create a Consumer Account",
        href: "/consumer/signup",
      }}
    >
      <BusinessSignupForm />
    </AuthLayout>
  );
}