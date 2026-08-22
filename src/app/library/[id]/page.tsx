import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SummaryContent } from "@/app/summary-content";
import { TestContent } from "@/app/test-content";
import { MindmapContent } from "@/app/mindmap-content";
import { PresentationContent } from "@/app/presentation-content";

const TYPE_ICON: Record<string, string> = {
  test: "❓ ",
  mindmap: "🧠 ",
  presentation: "🎞 ",
  summary: "📝 ",
};

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
        {TYPE_ICON[project.type] ?? ""}
        {project.title}
      </h1>

      {project.type === "test" && (
        <TestContent resultText={project.result_text} />
      )}
      {project.type === "mindmap" && (
        <MindmapContent resultText={project.result_text} color={project.color} />
      )}
      {project.type === "presentation" && (
        <PresentationContent
          resultText={project.result_text}
          color={project.color}
        />
      )}
      {project.type === "summary" && (
        <SummaryContent text={project.result_text} color={project.color} />
      )}
    </main>
  );
}
