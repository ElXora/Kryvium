import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_EMAIL_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { error: "GOOGLE_SCRIPT_EMAIL_URL is not set on the server." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { name, email, subject, message } = body as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });

    const data = await res.json().catch(() => ({ ok: false }));

    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to send email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : "Unknown error sending email.";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
