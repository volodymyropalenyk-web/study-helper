"use client";

import { useState } from "react";
import { getTheme } from "@/lib/color-themes";

type Slide = { title: string; emoji: string; bullets: string[] };
type Presentation = { slides: Slide[] };

export function PresentationContent({
  resultText,
  color,
}: {
  resultText: string;
  color?: string;
}) {
  const [index, setIndex] = useState(0);
  const theme = getTheme(color);

  let deck: Presentation;
  try {
    deck = JSON.parse(resultText);
  } catch {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Не вдалося прочитати презентацію.
      </p>
    );
  }

  const slides = deck.slides;
  const slide = slides[index];
  const isTitleSlide = index === 0;

  function go(delta: number) {
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + delta)));
  }

  return (
    <div
      className={`animate-fade-in-up rounded-3xl border p-6 shadow-xl shadow-black/5 ${theme.cardClass}`}
    >
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Слайд {index + 1} з {slides.length}
        </span>
      </div>

      <div
        className={`flex min-h-[320px] flex-col justify-center rounded-2xl border border-white/60 bg-white/90 p-8 shadow-sm dark:border-white/5 dark:bg-slate-800/80 ${
          isTitleSlide ? "items-center text-center" : ""
        }`}
      >
        <div className={isTitleSlide ? "text-6xl" : "text-3xl"}>
          {slide.emoji}
        </div>
        <h2
          className={`mt-3 font-bold text-slate-900 dark:text-slate-100 ${
            isTitleSlide ? "text-2xl" : "text-xl"
          }`}
        >
          {slide.title}
        </h2>

        {slide.bullets.length > 0 && (
          <ul
            className={`mt-5 flex flex-col gap-2.5 ${isTitleSlide ? "items-center" : ""}`}
          >
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className={`flex gap-2 text-slate-700 dark:text-slate-300 ${
                  isTitleSlide ? "" : "items-start"
                }`}
              >
                {!isTitleSlide && (
                  <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-br ${theme.gradient}`} />
                )}
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Назад
        </button>

        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? `w-5 bg-gradient-to-r ${theme.gradient}`
                  : "w-2 bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
          className={`rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-medium text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${theme.gradient}`}
        >
          Далі →
        </button>
      </div>
    </div>
  );
}
