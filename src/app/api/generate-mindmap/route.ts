import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { resolveContent, type ResolveInput } from "@/lib/resolve-content";
import { ai } from "@/lib/gemini";
import { THEME_IDS } from "@/lib/color-themes";

export const maxDuration = 300;

const mindmapSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Головна тема, дуже коротко (2-4 слова), українською",
    },
    emoji: {
      type: Type.STRING,
      description: "Один емодзі-символ, що найкраще відображає головну тему",
    },
    branches: {
      type: Type.ARRAY,
      description: "3-6 головних гілок/підтем матеріалу",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Назва гілки, коротко (2-5 слів)",
          },
          emoji: {
            type: Type.STRING,
            description: "Один емодзі-символ для цієї гілки",
          },
          thesis: {
            type: Type.STRING,
            description: "Коротка теза-пояснення цієї гілки (одне речення)",
          },
          children: {
            type: Type.ARRAY,
            description:
              "0-4 дрібніших підпункти цієї гілки; порожній масив, якщо непотрібно",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Коротко, 2-5 слів" },
                thesis: {
                  type: Type.STRING,
                  description: "Дуже коротка теза, до 12 слів",
                },
              },
              required: ["title", "thesis"],
            },
          },
        },
        required: ["title", "emoji", "thesis", "children"],
      },
    },
  },
  required: ["title", "emoji", "branches"],
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const body = (await request.json()) as ResolveInput & {
    title?: string;
    color?: string;
  };
  const color = THEME_IDS.includes(body.color as (typeof THEME_IDS)[number])
    ? body.color
    : "teal";

  let contents: Awaited<ReturnType<typeof resolveContent>>["contents"];
  let inputTextForStorage: string;
  try {
    ({ contents, inputTextForStorage } = await resolveContent(body, supabase));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Некоректні дані" },
      { status: 400 },
    );
  }

  let resultText: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction:
          "Ти допомагаєш учням і студентам готуватися до контрольних та іспитів. " +
          "Побудуй інтелект-карту (mind map) за наданим матеріалом українською мовою: " +
          "головна тема в центрі, від неї 3-6 головних гілок з короткими тезами, " +
          "і за потреби у кожної гілки — кілька дрібніших підпунктів. " +
          "Обирай емодзі, які справді відповідають змісту гілки (не 🔵 для всього). " +
          "Формули та хімічні сполуки пиши звичайним текстом із юнікод-символами для " +
          "підрядкових/надрядкових індексів (наприклад, H₂O, CO₂), БЕЗ LaTeX-синтаксису.",
        responseMimeType: "application/json",
        responseSchema: mindmapSchema,
      },
    });
    resultText = response.text ?? "";

    let branchCount = 0;
    try {
      branchCount = JSON.parse(resultText).branches?.length ?? 0;
    } catch {
      branchCount = 0;
    }
    if (branchCount === 0) {
      console.error(
        "[generate-mindmap] empty/invalid response, finishReason:",
        response.candidates?.[0]?.finishReason,
      );
      return NextResponse.json(
        {
          error:
            "Gemini не зміг побудувати карту для цього матеріалу. Спробуй з іншим текстом/файлом.",
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[generate-mindmap] gemini error:", err);
    return NextResponse.json(
      { error: "Не вдалося створити інтелект-карту. Спробуй ще раз." },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      type: "mindmap",
      title: body.title?.trim() || "Карта без назви",
      input_text: inputTextForStorage,
      result_text: resultText,
      color,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
