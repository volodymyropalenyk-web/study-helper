"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    if (!data.session) {
      setErrorMessage(
        mode === "signup"
          ? "Не вдалося увійти одразу після реєстрації. Можливо, ця пошта вже зареєстрована — спробуй увійти замість реєстрації, або перевір, чи потрібне підтвердження email."
          : "Не вдалося увійти. Спробуй ще раз.",
      );
      setStatus("error");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in-up rounded-3xl border border-card-border bg-card p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-slate-600 text-2xl shadow-lg shadow-teal-900/20">
            📚
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Brainmatika
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {mode === "signin" ? "Увійди в акаунт" : "Створи акаунт"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            type="email"
            required
            placeholder="пошта@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900/40"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Пароль (мінімум 6 символів)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:ring-teal-900/40"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <span className="relative z-10">
              {status === "loading"
                ? "Зачекай..."
                : mode === "signin"
                  ? "Увійти"
                  : "Зареєструватися"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </button>
          {status === "error" && (
            <p className="animate-fade-in-up rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {errorMessage}
            </p>
          )}
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setErrorMessage("");
            setStatus("idle");
          }}
          className="mt-5 w-full text-center text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
        >
          {mode === "signin"
            ? "Немає акаунта? Зареєструватися"
            : "Вже є акаунт? Увійти"}
        </button>
      </div>
    </main>
  );
}
