"use client";

import { useRef, useState } from "react";
import { getTheme, getBranchGradients } from "@/lib/color-themes";

type Child = { title: string; thesis: string };
type Branch = {
  title: string;
  emoji: string;
  thesis: string;
  children: Child[];
};
type Mindmap = { title: string; emoji: string; branches: Branch[] };

export function MindmapContent({
  resultText,
  color,
}: {
  resultText: string;
  color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const theme = getTheme(color);
  const branchGradients = getBranchGradients(color);

  let map: Mindmap;
  try {
    map = JSON.parse(resultText);
  } catch {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Не вдалося прочитати карту.
      </p>
    );
  }

  async function handleDownload() {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: theme.exportBg,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${map.title || "mindmap"}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className={`animate-fade-in-up rounded-3xl border p-6 shadow-xl shadow-black/5 backdrop-blur-sm ${theme.cardClass}`}
    >
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:text-white"
        >
          {downloading ? "Готуємо файл..." : "⬇ Завантажити як зображення"}
        </button>
      </div>

      <div ref={containerRef} className="p-4">
        {/* Central node */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} text-4xl shadow-lg shadow-teal-900/30`}
          >
            {map.emoji}
          </div>
          <div className="rounded-lg bg-slate-900 px-4 py-1.5 text-center font-bold text-white shadow-md dark:bg-slate-700">
            {map.title}
          </div>
        </div>

        {/* Branches */}
        <div className="mx-auto mt-2 flex max-w-2xl flex-col">
          {map.branches.map((branch, i) => {
            const branchColor = branchGradients[i % branchGradients.length];
            return (
              <div key={i} className="flex gap-3">
                {/* connector column */}
                <div className="flex w-8 flex-shrink-0 flex-col items-center">
                  <div
                    className={`w-0.5 flex-1 ${theme.connectorClass} ${i === 0 ? "invisible" : ""}`}
                  />
                  <div
                    className={`h-6 w-full rounded-bl-xl border-b-2 border-l-2 ${theme.connectorBorderClass}`}
                  />
                  <div
                    className={`w-0.5 flex-1 ${theme.connectorClass} ${
                      i === map.branches.length - 1 ? "invisible" : ""
                    }`}
                  />
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm dark:border-white/5 dark:bg-slate-800/80">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${branchColor} text-lg shadow-sm`}
                    >
                      {branch.emoji}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {branch.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {branch.thesis}
                      </div>
                    </div>
                  </div>

                  {branch.children.length > 0 && (
                    <div
                      className={`ml-5 mt-2 flex flex-col gap-1.5 border-l-2 pl-4 ${theme.connectorBorderClass}`}
                    >
                      {branch.children.map((child, j) => (
                        <div key={j} className="flex items-baseline gap-1.5 text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {child.title}:
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {child.thesis}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
