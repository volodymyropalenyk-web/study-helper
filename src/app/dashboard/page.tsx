"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/app/sign-out-button";
import { SummaryContent } from "@/app/summary-content";
import { TestContent } from "@/app/test-content";
import { MindmapContent } from "@/app/mindmap-content";
import { createClient } from "@/lib/supabase/client";

type Mode = "summary" | "test" | "mindmap";
type Source = "text" | "pdf" | "url";

const MODES: { id: Mode; label: string; endpoint: string; cta: string }[] = [
  {
    id: "summary",
    label: "📝 Конспект",
    endpoint: "/api/summarize",
    cta: "Створити конспект",
  },
  {
    id: "test",
    label: "❓ Тест",
    endpoint: "/api/generate-test",
    cta: "Створити тест",
  },
  {
    id: "mindmap",
    label: "🧠 Карта",
    endpoint: "/api/generate-mindmap",
    cta: "Створити карту",
  },
];

const SOURCES: { id: Source; label: string }[] = [
  { id: "text", label: "Текст" },
  { id: "pdf", label: "PDF" },
  { id: "url", label: "Посилання" },
];

const MAX_PDF_BYTES = 20 * 1024 * 1024;

const inputClass =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900/40";

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>("summary");
  const [source, setSource] = useState<Source>("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [focus, setFocus] = useState("");
  const [status, setStatus] = useState<
    "idle" | "uploading" | "loading" | "error"
  >("idle");
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = MODES.find((m) => m.id === mode)!;

  function switchMode(next: Mode) {
    setMode(next);
    resetForm();
  }

  function resetForm() {
    setResult(null);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (source === "pdf" && !pdfFile) {
      setErrorMessage("Обери PDF-файл.");
      setStatus("error");
      return;
    }
    if (source === "url" && !url.trim()) {
      setErrorMessage("Встав посилання.");
      setStatus("error");
      return;
    }
    if (source === "text" && !text.trim()) {
      setErrorMessage("Встав текст.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setResult(null);

    try {
      let payload: Record<string, unknown>;
      if (source === "pdf" && pdfFile) {
        setStatus("uploading");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setStatus("error");
          setErrorMessage("Сесія закінчилась. Онови сторінку і зайди знову.");
          return;
        }

        const safeName = pdfFile.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(path, pdfFile, { contentType: "application/pdf" });

        if (uploadError) {
          setStatus("error");
          setErrorMessage(`Не вдалося завантажити файл: ${uploadError.message}`);
          return;
        }

        payload = {
          source: "pdf",
          pdfPath: path,
          pdfFileName: pdfFile.name,
          title,
          focus,
        };
        setStatus("loading");
      } else if (source === "url") {
        payload = { source: "url", url: url.trim(), title, focus };
      } else {
        payload = { source: "text", text, title, focus };
      }

      const res = await fetch(current.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Brainmatika
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

      <div className="mb-6 flex gap-2 rounded-2xl border border-card-border bg-card p-1.5 shadow-md shadow-black/5 backdrop-blur-sm">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              mode === m.id
                ? "bg-gradient-to-r from-teal-600 to-slate-700 text-white shadow-md shadow-teal-900/20"
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!result && (
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
              className={inputClass}
            />

            <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 text-sm dark:bg-slate-800/60">
              {SOURCES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={`flex-1 rounded-lg py-1.5 font-medium transition-colors ${
                    source === s.id
                      ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {source === "text" && (
              <textarea
                placeholder="Встав сюди текст з книжки або сайту..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className={inputClass}
              />
            )}

            {source === "url" && (
              <input
                type="url"
                placeholder="https://example.com/стаття"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={inputClass}
              />
            )}

            {source === "pdf" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file && file.size > MAX_PDF_BYTES) {
                      setErrorMessage(
                        `Файл завеликий: ${(file.size / 1024 / 1024).toFixed(1)} МБ (максимум 20 МБ).`,
                      );
                      setStatus("error");
                      setPdfFile(null);
                      e.target.value = "";
                      return;
                    }
                    setErrorMessage("");
                    setStatus("idle");
                    setPdfFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition-colors ${
                    pdfFile
                      ? "border-teal-300 bg-teal-50/50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/20 dark:text-teal-300"
                      : "border-slate-300 text-slate-500 hover:border-teal-300 dark:border-slate-600 dark:text-slate-400"
                  }`}
                >
                  {pdfFile
                    ? `📄 ${pdfFile.name}`
                    : "Натисни, щоб обрати PDF-файл"}
                </button>
              </>
            )}

            {(source === "pdf" || source === "url") && (
              <input
                type="text"
                placeholder="На чому зосередитись? (необов'язково, наприклад: тільки розділ 3)"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className={inputClass}
              />
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "uploading"}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {(status === "loading" || status === "uploading") && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {status === "uploading"
                  ? "Завантажуємо файл..."
                  : status === "loading"
                    ? "Зачекай, генеруємо... (великі файли можуть довше)"
                    : current.cta}
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
      )}

      {result && (
        <div className="animate-fade-in-up">
          <div className="mb-4 flex justify-end">
            <button
              onClick={resetForm}
              className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
            >
              + Створити ще один
            </button>
          </div>
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
            {mode === "summary" && <SummaryContent text={result} />}
            {mode === "test" && <TestContent resultText={result} />}
            {mode === "mindmap" && <MindmapContent resultText={result} />}
          </div>
        </div>
      )}
    </main>
  );
}
