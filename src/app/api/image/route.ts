import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not set on the server. Add it in your Vercel project settings to enable image generation.",
      },
      { status: 500 }
    );
  }

  const { prompt }: { prompt: string } = await req.json();

  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Image provider error: ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { data?: string } }) => p.inlineData?.data
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "Image provider returned no image." },
        { status: 502 }
      );
    }

    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown image generation error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
