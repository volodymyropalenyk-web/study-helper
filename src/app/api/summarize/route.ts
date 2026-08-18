import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
          "Ти допомагаєш учням і студентам готуватися до контрольних та іспитів. " +
          "Зроби короткий, зручний і зрозумілий конспект наданого тексту українською мовою: " +
          "виділи головні тези, означення та ключові факти у вигляді структурованих пунктів " +
          "з підзаголовками. Прибери зайву воду, залиш тільки суть.",
      },
    });
    resultText = response.text ?? "";
  } catch (err) {
    console.error("[summarize] gemini error:", err);
    return NextResponse.json(
      { error: "Не вдалося створити конспект. Спробуй ще раз." },
      { status: 502 },
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      type: "summary",
      title: title?.trim() || "Конспект без назви",
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
