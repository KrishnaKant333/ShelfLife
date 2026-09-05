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
    subject: "Welcome to ShelfLife — Verify your email",
    text: `Welcome to ShelfLife!

    You're almost ready to start managing your inventory smarter and wasting less.

    Please verify your email address by opening this link:
    ${verificationUrl}

    This verification link expires in 24 hours.

    If you didn't create a ShelfLife account, you can safely ignore this email.

    — The ShelfLife Team
    `,
    html: `
        <div style="margin:0;padding:40px 20px;background:#f6f4ec;font-family:Arial,Helvetica,sans-serif;color:#18231c;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e1e5dc;border-radius:16px;overflow:hidden;">

            <div style="padding:28px 32px;border-bottom:1px solid #e8ebe4;">
            <div style="font-size:26px;font-weight:700;color:#2f6135;">
                ShelfLife
            </div>
            <div style="margin-top:6px;font-size:13px;color:#718078;">
                Know what's on your shelf. Before it goes to waste.
            </div>
            </div>

            <div style="padding:36px 32px;">
            <h1 style="margin:0;font-size:24px;line-height:1.3;color:#18231c;">
                Welcome to ShelfLife!
            </h1>

            <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#59665d;">
                You're almost ready to start managing your inventory smarter.
                Just verify your email address to activate your ShelfLife account.
            </p>

            <div style="margin:28px 0;text-align:center;">
                <a
                href="${verificationUrl}"
                style="display:inline-block;padding:13px 24px;background:#2f6135;color:#ffffff;text-decoration:none;border-radius:9px;font-size:15px;font-weight:600;"
                >
                Verify my email
                </a>
            </div>

            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#7a847d;">
                This verification link expires in <strong>24 hours</strong>.
            </p>

            <div style="margin-top:24px;padding:16px;background:#f6f4ec;border-radius:10px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#68736c;">
                If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:8px 0 0;font-size:12px;word-break:break-all;color:#2f6135;">
                ${verificationUrl}
                </p>
            </div>

            <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#7a847d;">
                If you didn't create a ShelfLife account, you can safely ignore this email.
            </p>
            </div>

            <div style="padding:20px 32px;background:#fafaf7;border-top:1px solid #e8ebe4;">
            <p style="margin:0;font-size:12px;color:#8a938c;">
                — The ShelfLife Team
            </p>
            </div>

        </div>
        </div>
    `,
    });
}