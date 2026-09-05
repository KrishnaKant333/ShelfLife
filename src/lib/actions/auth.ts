"use server";

import { Temporal } from "@/lib/temporal";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

import { db } from "@/prisma/db";
import { createHash, randomBytes } from "node:crypto";
import {
  isEmailVerificationConfigured,
  sendVerificationEmail,
} from "@/lib/email";


const baseSignupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const businessSignupSchema = baseSignupSchema.extend({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters."),
  industry: z
    .string()
    .trim()
    .min(2, "Industry is required."),
});

type AuthActionResult = {
  error?: string;
};

function createVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function registerConsumer(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const result = baseSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Invalid signup details.",
    };
  }

  const { name, email, password } = result.data;

  if (!isEmailVerificationConfigured()) {
    return {
      error: "Email verification is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM to .env.local, then restart the dev server.",
    };
  }

  const existingUser = await db.orm.public.User.first({
    email,
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verification = createVerificationToken();

  const createdUser = await db.orm.public.User.create({
    name,
    email,
    passwordHash,
    accountType: "consumer",
    plan: "consumer_free",
    emailVerificationTokenHash: verification.hash,
    emailVerificationExpiresAt: verification.expiresAt,
    emailVerifiedAt: null,
    updatedAt: Temporal.Now.instant(),
  });

  try {
    await sendVerificationEmail(email, verification.token);
  } catch {
    await db.orm.public.User.where({ id: createdUser.id }).delete();
    return { error: "We could not send the verification email. Please try again later." };
  }

  redirect(`/verify-email/pending?email=${encodeURIComponent(email)}`);
}

export async function registerBusiness(
  _previousState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const result = businessSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    businessName: formData.get("businessName"),
    industry: formData.get("industry"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Invalid signup details.",
    };
  }

  const {
    name,
    email,
    password,
    businessName,
    industry,
  } = result.data;

  if (!isEmailVerificationConfigured()) {
    return {
      error: "Email verification is not configured yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM to .env.local, then restart the dev server.",
    };
  }

  const existingUser = await db.orm.public.User.first({
    email,
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verification = createVerificationToken();

  const business = await db.orm.public.Business.create({
    name: businessName,
    industry,
    updatedAt: Temporal.Now.instant(),
  });

  let createdUser;
  try {
    createdUser = await db.orm.public.User.create({
    name,
    email,
    passwordHash,
    accountType: "business",
    businessId: business.id,
    plan: "business_starter",
    emailVerificationTokenHash: verification.hash,
    emailVerificationExpiresAt: verification.expiresAt,
    emailVerifiedAt: null,
    updatedAt: Temporal.Now.instant(),
    });
  } catch {
    await db.orm.public.Business.where({ id: business.id }).delete();
    throw new Error("We could not create your business account. Please try again.");
  }

  try {
    await sendVerificationEmail(email, verification.token);
  } catch {
    await db.orm.public.User.where({ id: createdUser.id }).delete();
    await db.orm.public.Business.where({ id: business.id }).delete();
    return { error: "We could not send the verification email. Please try again later." };
  }

  redirect(`/verify-email/pending?email=${encodeURIComponent(email)}`);
}

export async function verifyEmailAction(token: string): Promise<void> {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await db.orm.public.User.first({
    emailVerificationTokenHash: tokenHash,
  });

  if (!user || !user.emailVerificationExpiresAt) {
    throw new Error("This verification link is invalid or has expired.");
  }

  if (new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) {
    throw new Error("This verification link has expired. Request a new one.");
  }

  await db.orm.public.User.where({ id: user.id }).update({
    emailVerifiedAt: new Date().toISOString(),
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
  });

  redirect(user.accountType === "business" ? "/business/login?verified=1" : "/consumer/login?verified=1");
}