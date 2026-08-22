import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveContent, type ResolveInput } from "@/lib/resolve-content";
import { ai } from "@/lib/gemini";
import { THEME_IDS } from "@/lib/color-themes";

export const maxDuration = 300;

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
          "Зроби короткий, зручний і зрозумілий конспект наданого матеріалу українською мовою. " +
          "Форматуй відповідь у Markdown: підзаголовки через '## ', ключові терміни та " +
          "означення виділяй **жирним**, факти й тези подавай маркованими списками ('- '). " +
          "Формули, хімічні сполуки та математичні вирази пиши звичайним текстом із " +
          "юнікод-символами для підрядкових/надрядкових індексів (наприклад, H₂O, CO₂, x², HbO₂), " +
          "БЕЗ LaTeX-синтаксису (не використовуй $, \\text{}, \\frac{} тощо), і обов'язково " +
          "бери кожну формулу/сполуку в одинарні зворотні лапки як inline code " +
          "(наприклад, `H₂O`, `HbO₂`), щоб вона візуально виділялась серед тексту. " +
          "Прибери зайву воду, залиш тільки суть.",
      },
    });
    resultText = response.text ?? "";
    if (!resultText.trim()) {
      console.error(
        "[summarize] empty response, finishReason:",
        response.candidates?.[0]?.finishReason,
      );
      return NextResponse.json(
        {
          error:
            "Gemini не зміг згенерувати конспект для цього матеріалу. Спробуй з іншим текстом/файлом.",
        },
        { status: 502 },
      );
    }
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
      title: body.title?.trim() || "Конспект без назви",
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
