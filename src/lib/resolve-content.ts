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

type Part = string | { inlineData: { mimeType: string; data: string } };

export type ResolveInput =
  | { source: "text"; text: string; focus?: string }
  | { source: "url"; url: string; focus?: string }
  | { source: "pdf"; pdfBase64: string; pdfFileName?: string; focus?: string };

export type ResolvedContent = {
  contents: Part[];
  inputTextForStorage: string;
};

function withFocus(parts: Part[], focus?: string): Part[] {
  const trimmed = focus?.trim();
  if (!trimmed) return parts;
  return [...parts, `Зверни особливу увагу саме на: ${trimmed}`];
}

export async function resolveContent(
  input: ResolveInput,
): Promise<ResolvedContent> {
  if (input.source === "pdf") {
    return {
      contents: withFocus(
        [{ inlineData: { mimeType: "application/pdf", data: input.pdfBase64 } }],
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
        signal: AbortSignal.timeout(15000),
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
    const text = stripHtml(html).slice(0, 60000);
    if (text.length < 50) {
      throw new Error("На сторінці не знайшлося достатньо тексту.");
    }
    return {
      contents: withFocus([text], input.focus),
      inputTextForStorage: text,
    };
  }

  return {
    contents: withFocus([input.text], input.focus),
    inputTextForStorage: input.text,
  };
}
