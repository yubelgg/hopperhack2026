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

  const prompt = `You are a concise literary assistant. The reader is studying "${bookName}" and doesn't understand this passage:

"${passage}"

Respond in exactly three short sections (2–3 sentences each) using markdown headers:

### What this passage means
Plain-language explanation.

### How it fits the story
How this connects to the plot and themes of "${bookName}".

### Literary devices
Key symbols, techniques, or character significance — only what's most relevant.

Be warm and clear. Do not add a summary paragraph or closing question.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return NextResponse.json({ explanation: response.text });
}
