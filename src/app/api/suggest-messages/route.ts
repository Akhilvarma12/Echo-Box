// app/api/suggest-messages/route.ts
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const prompt =
      "You are an assistant that generates three open-ended, friendly, and non-sensitive questions " +
      "for a public anonymous messaging platform. Output the three questions as a single string " +
      "separated by '||'. Example: \"What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?\"";

    const result = streamText({
      model: google("models/gemini-2.5-flash"),
      prompt, // <-- pass prompt string instead of messages array
      // optional: temperature, max_tokens, etc
    });
    

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    console.error("Error in /api/suggest-messages:", err);
    if (err instanceof Error) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
