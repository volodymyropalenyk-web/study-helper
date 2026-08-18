import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/app/sign-out-button";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, type, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Моя бібліотека
        </h1>
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
          >
            + Новий конспект
          </Link>
          <SignOutButton />
        </div>
      </div>

      {!projects || projects.length === 0 ? (
        <p className="animate-fade-in-up rounded-3xl border border-card-border bg-card p-6 text-sm text-slate-500 shadow-xl shadow-black/5 backdrop-blur-sm dark:text-slate-400">
          Тут ще нічого немає. Створи свій перший конспект.
        </p>
      ) : (
        <ul className="flex animate-fade-in-up flex-col gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/library/${project.id}`}
                className="group block rounded-2xl border border-card-border bg-card p-4 shadow-md shadow-black/5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg hover:shadow-black/10 dark:hover:border-teal-700"
              >
                <div className="font-medium text-slate-900 transition-colors group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                  {project.title}
                </div>
                <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {new Date(project.created_at).toLocaleDateString("uk-UA")}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
