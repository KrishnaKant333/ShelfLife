import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    accountType: "consumer" | "business";
    businessId?: string;
    plan?: "consumer_free" | "consumer_plus" | "business_starter" | "business_pro" | "business_growth";
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType: "consumer" | "business";
      businessId?: string;
      plan?: "consumer_free" | "consumer_plus" | "business_starter" | "business_pro" | "business_growth";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accountType: "consumer" | "business";
    businessId?: string;
    plan?: "consumer_free" | "consumer_plus" | "business_starter" | "business_pro" | "business_growth";
  }
}