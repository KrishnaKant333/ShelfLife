import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createHash } from "node:crypto";

import { db } from "@/prisma/db";

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  verificationToken: z.string().optional(),
  accountType: z.enum(["consumer", "business"]),
}).refine(
  (value) => Boolean(value.verificationToken || (value.email && value.password)),
  { message: "Credentials are incomplete." },
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        verificationToken: {},
        accountType: {},
      },

      async authorize(credentials) {
        const result = credentialsSchema.safeParse(credentials);

        if (!result.success) {
          return null;
        }

        const { email, password, verificationToken, accountType } = result.data;

        if (verificationToken) {
          const tokenHash = createHash("sha256").update(verificationToken).digest("hex");
          const user = await db.orm.public.User.first({
            emailVerificationTokenHash: tokenHash,
          });

          if (
            !user ||
            !user.emailVerificationExpiresAt ||
            new Date(user.emailVerificationExpiresAt).getTime() < Date.now() ||
            user.accountType !== accountType
          ) {
            return null;
          }

          await db.orm.public.User.where({ id: user.id }).update({
            emailVerifiedAt: new Date().toISOString(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
          });

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            accountType: user.accountType,
            businessId: user.businessId ? String(user.businessId) : undefined,
            plan: user.plan,
          };
        }

        const user = await db.orm.public.User.first({
          email: email!.toLowerCase(),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.emailVerifiedAt) {
          return null;
        }

        if (user.accountType !== accountType) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          password!,
          user.passwordHash,
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          accountType: user.accountType,
          businessId: user.businessId
            ? String(user.businessId)
            : undefined,
          plan: user.plan,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accountType = user.accountType;
        token.businessId = user.businessId;
        token.plan = user.plan;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as
          | "consumer"
          | "business";

        session.user.businessId = token.businessId as
          | string
          | undefined;
          
        session.user.plan = token.plan as 
          | "consumer_free"
          | "consumer_plus"
          | "business_starter"
          | "business_pro"
          | "business_growth"
          | undefined;
      }

      return session;
    },
  },
});