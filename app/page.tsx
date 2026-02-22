"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
    const [bookName, setBookName] = useState("");
    const [passage, setPassage] = useState("");
    const [suggestions, setSuggestions] = useState<{ title: string; author: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function handleBookNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setBookName(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            const res = await fetch(`/api/books?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            setSuggestions(data.suggestions ?? []);
            setShowSuggestions(true);
        }, 300);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setExplanation(null);
        setLoading(true);

        try {
            const res = await fetch("/api/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookName, passage }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
            } else {
                setExplanation(data.explanation);
            }
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4">
            <main className="mx-auto max-w-2xl">
                
               {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className={`text-6xl font-bold tracking-tight text-zinc-900 mb-2 italic`} 
                        style={{ fontFamily: '"Computer Modern Serif", "CMU Serif", "Times New Roman", serif' }}>
                        understory
                    </h1>
                        <p className="mt-2 text-lg text-zinc-500">
                            Understand any passage, any book.
                        </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="relative mb-4" ref={wrapperRef}>
                        <label
                            htmlFor="bookName"
                            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Book Name
                        </label>
                        <input
                            id="bookName"
                            type="text"
                            value={bookName}
                            onChange={handleBookNameChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
                            autoComplete="off"
                            placeholder='e.g. "1984" by George Orwell'
                            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        onMouseDown={() => {
                                            setBookName(s.title);
                                            setSuggestions([]);
                                            setShowSuggestions(false);
                                        }}
                                        className="flex cursor-pointer flex-col px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    >
                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{s.title}</span>
                                        {s.author && (
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{s.author}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="passage"
                            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Passage
                        </label>
                        <textarea
                            id="passage"
                            value={passage}
                            onChange={(e) => setPassage(e.target.value)}
                            placeholder="Paste the paragraph or page you want explained..."
                            rows={7}
                            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        {loading ? "Explaining…" : "Explain This Passage"}
                    </button>
                </form>

                {/* Loading spinner */}
                {loading && (
                    <div className="mt-8 flex items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
                        <svg
                            className="h-5 w-5 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <span className="text-sm">Asking LitHelper…</span>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Explanation */}
                {explanation && (
                    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            <span>📖</span> Context &amp; Explanation
                        </h2>
                        <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert">
                            <ReactMarkdown>{explanation}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
