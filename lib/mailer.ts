import nodemailer from "nodemailer"

// Sends email via SMTP when configured; otherwise logs the message to the
// server console so the flow is fully testable in development.

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

interface Mail {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendMail(mail: Mail): Promise<{ delivered: boolean }> {
  if (!isSmtpConfigured()) {
    console.log(
      `\n[mailer] SMTP not configured — logging email instead\n` +
        `  To:      ${mail.to}\n` +
        `  Subject: ${mail.subject}\n` +
        `  Body:    ${mail.text.replace(/\n/g, "\n           ")}\n`,
    )
    return { delivered: false }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "FinShastra <no-reply@finshastra.local>",
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  })
  return { delivered: true }
}
