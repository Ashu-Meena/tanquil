import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { checkFixedWindow, RATE_LIMIT_CONFIG } from '@/lib/rate-limit';

import { z } from "zod";

const emailSchema = z.object({
  to: z.string().email("Invalid email format").max(255),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  html: z.string().min(1, "HTML content is required").max(50000, "HTML content too large"),
}).strict();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = checkFixedWindow(ip, RATE_LIMIT_CONFIG.PUBLIC_MAX_REQUESTS, RATE_LIMIT_CONFIG.PUBLIC_WINDOW_MS);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429, 
          headers: { "Retry-After": Math.ceil(rateLimitResult.retryAfterMs! / 1000).toString() }
        }
      );
    }

    let body: z.infer<typeof emailSchema>;
    try {
      const rawBody = await request.json();
      body = emailSchema.parse(rawBody);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid request format.", details: err.issues }, { status: 400 });
      }
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { to, subject, html } = body;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP credentials missing. Simulating email send for:", to);
      return NextResponse.json({ message: 'Email simulation successful (no credentials)' }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_FROM || '"Tranquil" <hello@tranquil.co.in>',
      to,
      subject,
      html,
    });

    return NextResponse.json({ message: 'Email sent successfully', id: info.messageId }, { status: 200 });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 });
  }
}
