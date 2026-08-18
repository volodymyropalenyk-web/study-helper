"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/app/sign-out-button";
import { SummaryContent } from "@/app/summary-content";

export default function DashboardPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Щось пішло не так");
        return;
      }

      setStatus("idle");
      setResult(data.project.result_text);
    } catch {
      setStatus("error");
      setErrorMessage("Немає з'єднання з сервером. Спробуй ще раз.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Створити конспект
        </h1>
        <div className="flex items-center gap-5">
          <Link
            href="/library"
            className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Моя бібліотека
          </Link>
          <SignOutButton />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up rounded-3xl border border-card-border bg-card p-6 shadow-xl shadow-black/5 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-3.5">
          <input
            type="text"
            placeholder="Назва (наприклад: Біологія, тема 5)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900/40"
          />
          <textarea
            required
            placeholder="Встав сюди текст з книжки або сайту..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900/40"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {status === "loading" && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {status === "loading"
                ? "Створюємо конспект..."
                : "Створити конспект"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </button>
          {status === "error" && (
            <p className="animate-fade-in-up rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {errorMessage}
            </p>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-6 animate-fade-in-up rounded-3xl border border-card-border bg-card p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
          <SummaryContent text={result} />
        </div>
      )}
    </main>
  );
}
