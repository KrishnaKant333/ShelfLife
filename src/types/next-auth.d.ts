import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    accountType: "consumer" | "business";
    businessId?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType: "consumer" | "business";
      businessId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accountType: "consumer" | "business";
    businessId?: string;
  }
}