export const maxDuration = 30;

import { getSystemPrompt } from "@/constants";

export async function POST(req: Request) {
  const {
    messages,
    language,
  }: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    language: string;
  } = await req.json();

  const systemPrompt = getSystemPrompt(language);

  // Combine system prompt + user messages into one content block
  const promptText =
    systemPrompt +
    "\n\n" +
    messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

  const body = {
    contents: [
      {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.NEXT_GEMINI_API_KEY!, // 👈 put your key in .env
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error response:", errText);
      return new Response("Gemini API error", { status: 500 });
    }

    const result = await response.json();
    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
    return new Response(JSON.stringify({ message: reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
