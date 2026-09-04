import nodemailer from "nodemailer";

export function isEmailVerificationConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_FROM,
  );
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Email verification is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email verification is not configured. Set EMAIL_FROM.");
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Verify your ShelfLife email",
    text: `Verify your ShelfLife account by opening this link: ${verificationUrl}`,
    html: `<p>Verify your ShelfLife account:</p><p><a href="${verificationUrl}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}