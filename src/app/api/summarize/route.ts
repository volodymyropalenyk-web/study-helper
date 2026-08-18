import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveContent, type ResolveInput } from "@/lib/resolve-content";
import { ai } from "@/lib/gemini";

export const maxDuration = 60;

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
          "Ти допомагаєш учням і студентам готуватися до контрольних та іспитів. " +
          "Зроби короткий, зручний і зрозумілий конспект наданого матеріалу українською мовою. " +
          "Форматуй відповідь у Markdown: підзаголовки через '## ', ключові терміни та " +
          "означення виділяй **жирним**, факти й тези подавай маркованими списками ('- '). " +
          "Прибери зайву воду, залиш тільки суть.",
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
      title: body.title?.trim() || "Конспект без назви",
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
