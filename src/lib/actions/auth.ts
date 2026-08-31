"use server";

import { Temporal } from "@/lib/temporal";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";

import { db } from "@/prisma/db";


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

  const existingUser = await db.orm.public.User.first({
    email,
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.orm.public.User.create({
    name,
    email,
    passwordHash,
    accountType: "consumer",
    plan: "consumer_free",
    updatedAt: Temporal.Now.instant(),
  });

  redirect("/consumer/login");
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

  const existingUser = await db.orm.public.User.first({
    email,
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const business = await db.orm.public.Business.create({
    name: businessName,
    industry,
    updatedAt: Temporal.Now.instant(),
  });

  await db.orm.public.User.create({
    name,
    email,
    passwordHash,
    accountType: "business",
    businessId: business.id,
    plan: "business_starter",
    updatedAt: Temporal.Now.instant(),
  });

  redirect("/business/login");
}