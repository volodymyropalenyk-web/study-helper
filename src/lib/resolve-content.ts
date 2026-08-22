import type { SupabaseClient } from "@supabase/supabase-js";
import { createPartFromUri, type PartUnion } from "@google/genai";
import { ai } from "@/lib/gemini";

const MAX_TEXT_CHARS = 200000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export type ResolveInput =
  | { source: "text"; text: string; focus?: string }
  | { source: "url"; url: string; focus?: string }
  | { source: "pdf"; pdfPath: string; pdfFileName?: string; focus?: string };

export type ResolvedContent = {
  contents: PartUnion[];
  inputTextForStorage: string;
};

function withFocus(parts: PartUnion[], focus?: string): PartUnion[] {
  const trimmed = focus?.trim();
  if (!trimmed) return parts;
  return [...parts, `Зверни особливу увагу саме на: ${trimmed}`];
}

async function waitUntilActive(name: string) {
  for (let i = 0; i < 60; i++) {
    const file = await ai.files.get({ name });
    if (file.state === "ACTIVE") return file;
    if (file.state === "FAILED") {
      throw new Error("Gemini не зміг обробити файл.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Файл обробляється надто довго. Спробуй ще раз.");
}

export async function resolveContent(
  input: ResolveInput,
  supabase: SupabaseClient,
): Promise<ResolvedContent> {
  if (input.source === "pdf") {
    const { data: blob, error: downloadError } = await supabase.storage
      .from("pdfs")
      .download(input.pdfPath);

    if (downloadError || !blob) {
      throw new Error("Не вдалося отримати завантажений PDF-файл.");
    }

    // Best-effort cleanup — the file was only needed for this one request.
    supabase.storage.from("pdfs").remove([input.pdfPath]).then(
      () => {},
      () => {},
    );

    const arrayBuffer = await blob.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: "application/pdf" });

    let uploaded = await ai.files.upload({
      file: fileBlob,
      config: {
        mimeType: "application/pdf",
        displayName: input.pdfFileName || "document.pdf",
      },
    });

    if (uploaded.state !== "ACTIVE") {
      uploaded = await waitUntilActive(uploaded.name!);
    }

    return {
      contents: withFocus(
        [createPartFromUri(uploaded.uri!, uploaded.mimeType!)],
        input.focus,
      ),
      inputTextForStorage: `[PDF файл: ${input.pdfFileName || "документ"}]`,
    };
  }

  if (input.source === "url") {
    let html: string;
    try {
      const res = await fetch(input.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Brainmatika/1.0)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        throw new Error(`Сайт відповів помилкою ${res.status}`);
      }
      html = await res.text();
    } catch {
      throw new Error(
        "Не вдалося завантажити сторінку за цим посиланням. Перевір URL.",
      );
    }
    const text = stripHtml(html).slice(0, MAX_TEXT_CHARS);
    if (text.length < 50) {
      throw new Error("На сторінці не знайшлося достатньо тексту.");
    }
    return {
      contents: withFocus([text], input.focus),
      inputTextForStorage: text,
    };
  }

  const text = input.text.trim();
  if (text.length === 0) {
    throw new Error("Порожній текст.");
  }
  const truncated = text.slice(0, MAX_TEXT_CHARS);

  return {
    contents: withFocus([truncated], input.focus),
    inputTextForStorage: truncated,
  };
}
