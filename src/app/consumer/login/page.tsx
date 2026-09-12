import AuthLayout from "@/components/auth/AuthLayout";
import ConsumerLoginForm from "@/components/auth/ConsumerLoginForm";

export default function ConsumerLoginPage() {
  return (
    <AuthLayout
      accountType="consumer"
      flowType="login"
      badgeText="Consumer Kitchen"
      title="Welcome back"
      subtitle="Sign in to manage your household pantry and fresh food inventory."
      editorialHeadline="Keep your kitchen organized and completely waste-free."
      editorialDescription="Monitor your ingredients, receive proactive expiration reminders, and turn pantry stock into healthy meals."
      highlights={[
        {
          title: "Pantry & Fridge Tracking",
          desc: "Full visibility over your food supplies, expiration dates, and quantities.",
        },
        {
          title: "AI Recipe Suggestions",
          desc: "Discover inspired recipes that use what you already have in stock.",
        },
        {
          title: "Proactive Expiry Alerts",
          desc: "Get notified before items reach their best-before window.",
        },
      ]}
      switchPrompt={{
        text: "Running a commercial food operation?",
        linkText: "Business Login",
        href: "/business/login",
      }}
    >
      <ConsumerLoginForm />
    </AuthLayout>
  );
}