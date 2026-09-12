import AuthLayout from "@/components/auth/AuthLayout";
import ConsumerSignupForm from "@/components/auth/ConsumerSignupForm";

export default function ConsumerSignupPage() {
  return (
    <AuthLayout
      accountType="consumer"
      flowType="signup"
      badgeText="Consumer Kitchen"
      title="Create your account"
      subtitle="Start tracking your household groceries and reducing food waste at home."
      editorialHeadline="Smarter food habits and zero household waste."
      editorialDescription="Join ShelfLife to organize your pantry, track shelf life automatically, and unlock intelligent recipes from the ingredients you already bought."
      highlights={[
        {
          title: "Automatic Shelf-Life Tracking",
          desc: "Category-aware longevity estimates for every item in your kitchen.",
        },
        {
          title: "Zero-Waste Meal Inspiration",
          desc: "Prioritize ingredients nearing their expiry dates with AI-assisted recipes.",
        },
        {
          title: "Fast Receipt & Barcode Capture",
          desc: "Log entire grocery hauls in seconds with smart camera scanning.",
        },
      ]}
      switchPrompt={{
        text: "Looking for commercial food operations?",
        linkText: "Create a Business Account",
        href: "/business/signup",
      }}
    >
      <ConsumerSignupForm />
    </AuthLayout>
  );
}