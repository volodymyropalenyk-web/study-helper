import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { resolveContent, type ResolveInput } from "@/lib/resolve-content";
import { ai } from "@/lib/gemini";

export const maxDuration = 300;

const testSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: "Текст питання українською",
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "3-4 варіанти відповіді для питання з вибором; порожній масив [], якщо це питання з відкритою короткою відповіддю (наприклад, дата, число, назва)",
          },
          answer: {
            type: Type.STRING,
            description:
              "Правильна відповідь: точний текст одного з варіантів (для питання з вибором) або сама коротка відповідь (для відкритого питання)",
          },
        },
        required: ["question", "options", "answer"],
      },
    },
  },
  required: ["questions"],
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const body = (await request.json()) as ResolveInput & { title?: string };

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
          "Ти складаєш тест для підготовки учнів і студентів до контрольної роботи за наданим текстом, українською мовою. " +
          "Створи 6-10 питань, що перевіряють розуміння головних фактів, означень і тез з тексту. " +
          "Більшість питань зроби з варіантами відповідей (3-4 варіанти, лише один правильний), " +
          "а кілька — з короткою відкритою відповіддю (наприклад, назва, дата, число, термін) — для них 'options' має бути порожнім масивом. " +
          "Формули, хімічні сполуки та математичні вирази пиши звичайним текстом із " +
          "юнікод-символами для підрядкових/надрядкових індексів (наприклад, H₂O, CO₂, x², HbO₂), " +
          "БЕЗ LaTeX-синтаксису (не використовуй $, \\text{}, \\frac{} тощо).",
        responseMimeType: "application/json",
        responseSchema: testSchema,
      },
    });
    resultText = response.text ?? "";

    let questionCount = 0;
    try {
      questionCount = JSON.parse(resultText).questions?.length ?? 0;
    } catch {
      questionCount = 0;
    }
    if (questionCount === 0) {
      console.error(
        "[generate-test] empty/invalid response, finishReason:",
        response.candidates?.[0]?.finishReason,
      );
      return NextResponse.json(
        {
          error:
            "Gemini не зміг згенерувати тест для цього матеріалу. Спробуй з іншим текстом/файлом.",
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[generate-test] gemini error:", err);
    return NextResponse.json(
      { error: "Не вдалося створити тест. Спробуй ще раз." },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      type: "test",
      title: body.title?.trim() || "Тест без назви",
      input_text: inputTextForStorage,
      result_text: resultText,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
