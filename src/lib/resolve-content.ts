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
  | { source: "text"; text: string }
  | { source: "url"; url: string }
  | { source: "pdf"; pdfBase64: string; pdfFileName?: string };

export type ResolvedContent = {
  contents: string | { inlineData: { mimeType: string; data: string } }[];
  inputTextForStorage: string;
};

export async function resolveContent(
  input: ResolveInput,
): Promise<ResolvedContent> {
  if (input.source === "pdf") {
    return {
      contents: [
        { inlineData: { mimeType: "application/pdf", data: input.pdfBase64 } },
      ],
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
    return { contents: text, inputTextForStorage: text };
  }

  return { contents: input.text, inputTextForStorage: input.text };
}
