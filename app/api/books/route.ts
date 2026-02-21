import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=6&fields=title,author_name`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  const suggestions = (data.docs ?? []).map(
    (doc: { title: string; author_name?: string[] }) => ({
      title: doc.title,
      author: doc.author_name?.[0] ?? "",
    }),
  );

  return NextResponse.json({ suggestions });
}
