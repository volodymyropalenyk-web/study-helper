"use client";

import { useRef, useState } from "react";
import { getTheme } from "@/lib/color-themes";
import { createClient } from "@/lib/supabase/client";

type Slide = {
  title: string;
  emoji: string;
  bullets: string[];
  imageUrl?: string;
};
type Presentation = { slides: Slide[] };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function urlToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function PresentationContent({
  resultText,
  color,
  projectId,
}: {
  resultText: string;
  color?: string;
  projectId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [deck, setDeck] = useState<Presentation | null>(() => {
    try {
      return JSON.parse(resultText);
    } catch {
      return null;
    }
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = getTheme(color);

  if (!deck) {
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

  async function handleImageUpload(file: File) {
    if (!deck) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Файл завеликий (максимум 5 МБ).");
      return;
    }
    setImageError("");
    setUploadingImage(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setImageError("Сесія закінчилась. Онови сторінку.");
        return;
      }

      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("slide-images")
        .upload(path, file);

      if (uploadError) {
        setImageError(`Не вдалося завантажити фото: ${uploadError.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("slide-images").getPublicUrl(path);

      const updatedDeck: Presentation = {
        slides: slides.map((s, i) =>
          i === index ? { ...s, imageUrl: publicUrl } : s,
        ),
      };
      setDeck(updatedDeck);

      if (projectId) {
        await supabase
          .from("projects")
          .update({ result_text: JSON.stringify(updatedDeck) })
          .eq("id", projectId);
      }
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage() {
    if (!deck) return;
    const updatedDeck: Presentation = {
      slides: slides.map((s, i) =>
        i === index ? { ...s, imageUrl: undefined } : s,
      ),
    };
    setDeck(updatedDeck);
    if (projectId) {
      const supabase = createClient();
      supabase
        .from("projects")
        .update({ result_text: JSON.stringify(updatedDeck) })
        .eq("id", projectId);
    }
  }

  async function handleDownloadPptx() {
    if (!deck) return;
    setExportingPptx(true);
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
      pptx.layout = "WIDE";

      for (const [i, s] of slides.entries()) {
        const pSlide = pptx.addSlide();
        pSlide.background = { color: theme.exportBg.replace("#", "") };

        const hasImage = Boolean(s.imageUrl);
        const textX = hasImage ? 0.6 : 0.8;
        const textW = hasImage ? 6.2 : 11.7;

        if (i === 0) {
          pSlide.addText(s.emoji, {
            x: 0,
            y: 1.3,
            w: "100%",
            h: 1.3,
            align: "center",
            fontSize: 60,
          });
          pSlide.addText(s.title, {
            x: 0.8,
            y: 2.7,
            w: 11.7,
            h: 1.2,
            align: "center",
            fontSize: 40,
            bold: true,
            color: "1e293b",
          });
          if (s.bullets[0]) {
            pSlide.addText(s.bullets[0], {
              x: 0.8,
              y: 4,
              w: 11.7,
              h: 0.8,
              align: "center",
              fontSize: 20,
              color: "475569",
            });
          }
        } else {
          pSlide.addText(`${s.emoji}  ${s.title}`, {
            x: textX,
            y: 0.5,
            w: textW,
            h: 0.9,
            fontSize: 28,
            bold: true,
            color: theme.hexAccent.replace("#", ""),
          });
          pSlide.addText(
            s.bullets.map((b) => ({ text: b, options: { bullet: true } })),
            {
              x: textX,
              y: 1.6,
              w: textW,
              h: 5.2,
              fontSize: 18,
              color: "1e293b",
              valign: "top",
              paraSpaceAfter: 14,
            },
          );
        }

        if (hasImage && s.imageUrl) {
          try {
            const dataUri = await urlToDataUri(s.imageUrl);
            pSlide.addImage({
              data: dataUri,
              x: 7.3,
              y: 0.6,
              w: 5.4,
              h: 6.3,
              sizing: { type: "contain", w: 5.4, h: 6.3 },
            });
          } catch {
            // skip image if it can't be fetched
          }
        }
      }

      await pptx.writeFile({ fileName: `${slides[0]?.title || "presentation"}.pptx` });
    } finally {
      setExportingPptx(false);
    }
  }

  return (
    <div
      className={`animate-fade-in-up rounded-3xl border p-6 shadow-xl shadow-black/5 ${theme.cardClass}`}
    >
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Слайд {index + 1} з {slides.length}
        </span>
        <button
          onClick={handleDownloadPptx}
          disabled={exportingPptx}
          className="font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-50 dark:text-slate-300 dark:hover:text-white"
        >
          {exportingPptx ? "Готуємо файл..." : "⬇ Завантажити PowerPoint"}
        </button>
      </div>

      <div
        className={`flex min-h-[320px] flex-col gap-4 rounded-2xl border border-white/60 bg-white/90 p-8 shadow-sm dark:border-white/5 dark:bg-slate-800/80 ${
          slide.imageUrl && !isTitleSlide ? "sm:flex-row sm:items-start" : ""
        }`}
      >
        <div
          className={`flex flex-1 flex-col ${isTitleSlide ? "items-center text-center justify-center" : ""}`}
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
                    <span
                      className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-br ${theme.gradient}`}
                    />
                  )}
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {slide.imageUrl && !isTitleSlide && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt=""
            className="max-h-72 w-full flex-1 rounded-xl object-contain sm:max-h-none sm:w-auto"
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 disabled:opacity-50 dark:text-teal-400 dark:hover:text-teal-300"
          >
            {uploadingImage
              ? "Завантажуємо..."
              : slide.imageUrl
                ? "🖼 Змінити фото"
                : "🖼 Додати фото"}
          </button>
          {slide.imageUrl && (
            <button
              onClick={removeImage}
              className="text-sm text-slate-400 transition-colors hover:text-red-500"
            >
              Прибрати
            </button>
          )}
        </div>
        {imageError && (
          <p className="text-xs text-red-600 dark:text-red-400">{imageError}</p>
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
