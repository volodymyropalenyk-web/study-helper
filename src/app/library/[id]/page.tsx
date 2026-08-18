import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href="/library"
        className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
      >
        ← Назад до бібліотеки
      </Link>

      <h1 className="mt-4 mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {project.title}
      </h1>

      <div className="animate-fade-in-up whitespace-pre-wrap rounded-3xl border border-card-border bg-card p-6 text-sm leading-relaxed text-slate-800 shadow-xl shadow-black/5 backdrop-blur-sm dark:text-slate-200">
        {project.result_text}
      </div>
    </main>
  );
}
