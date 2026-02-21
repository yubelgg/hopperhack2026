import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { bookName, passage } = await req.json();

  if (!bookName?.trim() || !passage?.trim()) {
    return NextResponse.json(
      { error: "Book name and passage are required." },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are a literary assistant helping readers understand books deeply.
The reader is studying "${bookName}" and doesn't understand this passage:

"${passage}"

Please explain:
1. **What this passage means** — in plain, accessible language
2. **How it fits the broader story and themes** of "${bookName}"
3. **Any important literary devices, symbolism, or character significance**

Keep your explanation warm, clear, and helpful for someone who is struggling with this section.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return NextResponse.json({ explanation: response.text });
}
