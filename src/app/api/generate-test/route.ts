import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

  const { text, title } = await request.json();

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Порожній текст" }, { status: 400 });
  }

  let resultText: string;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: text,
      config: {
        systemInstruction:
          "Ти складаєш тест для підготовки учнів і студентів до контрольної роботи за наданим текстом, українською мовою. " +
          "Створи 6-10 питань, що перевіряють розуміння головних фактів, означень і тез з тексту. " +
          "Більшість питань зроби з варіантами відповідей (3-4 варіанти, лише один правильний), " +
          "а кілька — з короткою відкритою відповіддю (наприклад, назва, дата, число, термін) — для них 'options' має бути порожнім масивом.",
        responseMimeType: "application/json",
        responseSchema: testSchema,
      },
    });
    resultText = response.text ?? "";
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
      title: title?.trim() || "Тест без назви",
      input_text: text,
      result_text: resultText,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
