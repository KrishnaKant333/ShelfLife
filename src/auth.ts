import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/prisma/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  accountType: z.enum(["consumer", "business"]),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        accountType: {},
      },

      async authorize(credentials) {
        const result = credentialsSchema.safeParse(credentials);

        if (!result.success) {
          return null;
        }

        const { email, password, accountType } = result.data;

        const user = await db.orm.public.User.first({
          email: email.toLowerCase(),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (user.accountType !== accountType) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          password,
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
      }

      return session;
    },
  },
});