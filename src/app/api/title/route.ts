import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ title: "New chat" });
  }

  const { message }: { message: string } = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message.slice(0, 500) }] }],
          systemInstruction: {
            parts: [
              {
                text: "Generate a short chat title (max 5 words, no quotes, no punctuation at the end) summarizing the topic of the user's message. Reply with ONLY the title text.",
              },
            ],
          },
          generationConfig: { maxOutputTokens: 20, temperature: 0.3 },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ title: "New chat" });

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const title = raw.trim().replace(/^"|"$/g, "") || "New chat";

    return NextResponse.json({ title: title.slice(0, 60) });
  } catch {
    return NextResponse.json({ title: "New chat" });
  }
}
