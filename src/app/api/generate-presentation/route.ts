import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { resolveContent, type ResolveInput } from "@/lib/resolve-content";
import { ai } from "@/lib/gemini";
import { THEME_IDS } from "@/lib/color-themes";

export const maxDuration = 300;

const presentationSchema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      description:
        "Слайди презентації. Перший слайд — титульний (назва теми, bullets може містити один короткий підзаголовок або бути порожнім).",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Заголовок слайду, коротко",
          },
          emoji: {
            type: Type.STRING,
            description: "Один емодзі-символ, що відповідає темі слайду",
          },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "3-5 коротких тез (не повні речення) для звичайного слайду; для титульного — 0-1 пункт",
          },
        },
        required: ["title", "emoji", "bullets"],
      },
    },
  },
  required: ["slides"],
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
    slideCount?: number;
  };
  const color = THEME_IDS.includes(body.color as (typeof THEME_IDS)[number])
    ? body.color
    : "teal";
  const slideCount = Math.min(
    15,
    Math.max(3, Math.round(Number(body.slideCount) || 8)),
  );

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
          "Ти допомагаєш учням і студентам готувати навчальні презентації за наданим матеріалом, українською мовою. " +
          `Створи РІВНО ${slideCount} слайдів. Перший слайд — титульний (назва теми, ` +
          "необов'язково короткий підзаголовок в одному bullet). Кожен наступний слайд — " +
          "3-5 коротких тез (не повні речення, без зайвих слів), одна головна думка на слайд. " +
          "Обирай емодзі, що справді відповідають змісту кожного слайду. " +
          "Формули та хімічні сполуки пиши звичайним текстом із юнікод-символами для " +
          "підрядкових/надрядкових індексів (наприклад, H₂O, CO₂), БЕЗ LaTeX-синтаксису.",
        responseMimeType: "application/json",
        responseSchema: presentationSchema,
      },
    });
    resultText = response.text ?? "";

    let slideCountResult = 0;
    try {
      slideCountResult = JSON.parse(resultText).slides?.length ?? 0;
    } catch {
      slideCountResult = 0;
    }
    if (slideCountResult === 0) {
      console.error(
        "[generate-presentation] empty/invalid response, finishReason:",
        response.candidates?.[0]?.finishReason,
      );
      return NextResponse.json(
        {
          error:
            "Gemini не зміг створити презентацію для цього матеріалу. Спробуй з іншим текстом/файлом.",
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[generate-presentation] gemini error:", err);
    return NextResponse.json(
      { error: "Не вдалося створити презентацію. Спробуй ще раз." },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      type: "presentation",
      title: body.title?.trim() || "Презентація без назви",
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
