import { NextRequest } from "next/server";
import { MODEL_OPTIONS, type ModelId } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { webSearch, formatSearchContext } from "@/lib/web-search";

export const runtime = "nodejs";

interface IncomingMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "GEMINI_API_KEY is not set on the server. Add it in your Vercel project settings.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  const {
    messages,
    model,
    thinkingMode,
    webSearch: webSearchEnabled,
    customInstructions,
  }: {
    messages: IncomingMessage[];
    model: ModelId;
    thinkingMode: boolean;
    webSearch: boolean;
    customInstructions?: string;
  } = body;

  const modelOption = MODEL_OPTIONS.find((m) => m.id === model) ?? MODEL_OPTIONS[0];
  const systemPrompt = buildSystemPrompt(modelOption.id, !!thinkingMode, !!webSearchEnabled, customInstructions);

  // Gemini has no "system" role in `contents` — system text goes in
  // `systemInstruction`, and any other system-role messages (e.g. search
  // context) get folded into the first user turn.
  let extraSystemContext = "";
  const conversational = messages.filter((m) => {
    if (m.role === "system") {
      extraSystemContext += (extraSystemContext ? "\n\n" : "") + m.content;
      return false;
    }
    return true;
  });

  if (webSearchEnabled) {
    const lastUserMessage = [...conversational].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      const results = await webSearch(lastUserMessage.content);
      const context = formatSearchContext(results, lastUserMessage.content);
      if (context) {
        extraSystemContext += (extraSystemContext ? "\n\n" : "") + context;
      }
    }
  }

  const contents = conversational.map((m, i) => {
    const isLastUser = i === conversational.length - 1 && m.role === "user";
    const text = isLastUser && extraSystemContext ? `${extraSystemContext}\n\n${m.content}` : m.content;
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    };
  });

  const url = (geminiModel: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const requestBody = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: modelOption.id === "kryvium-tank" ? 0.4 : 0.6,
      maxOutputTokens: 8000,
    },
  });

  try {
    let geminiRes = await fetch(url(modelOption.geminiModel), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    // Gemini model IDs get renamed/deprecated frequently — if the primary
    // model 404s, transparently retry once with the fallback model instead
    // of surfacing a broken error to the user.
    if (geminiRes.status === 404) {
      console.error(
        `Kryvium: model "${modelOption.geminiModel}" not found — retrying with fallback "${modelOption.fallbackGeminiModel}".`
      );
      geminiRes = await fetch(url(modelOption.fallbackGeminiModel), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
    }

    if (!geminiRes.ok || !geminiRes.body) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini error: ${errText.slice(0, 300)}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = geminiRes.body.getReader();

    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed?.candidates?.[0]?.content?.parts
                  ?.map((p: { text?: string }) => p.text ?? "")
                  .join("");
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                // skip malformed chunk
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error contacting Gemini.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
