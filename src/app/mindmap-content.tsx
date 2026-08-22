type Child = { title: string; thesis: string };
type Branch = {
  title: string;
  emoji: string;
  thesis: string;
  children: Child[];
};
type Mindmap = { title: string; emoji: string; branches: Branch[] };

const BRANCH_STYLES = [
  "border-teal-200 bg-teal-50/70 dark:border-teal-800/50 dark:bg-teal-950/30",
  "border-sky-200 bg-sky-50/70 dark:border-sky-800/50 dark:bg-sky-950/30",
  "border-indigo-200 bg-indigo-50/70 dark:border-indigo-800/50 dark:bg-indigo-950/30",
  "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-950/30",
  "border-cyan-200 bg-cyan-50/70 dark:border-cyan-800/50 dark:bg-cyan-950/30",
  "border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/30",
];

export function MindmapContent({ resultText }: { resultText: string }) {
  let map: Mindmap;
  try {
    map = JSON.parse(resultText);
  } catch {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Не вдалося прочитати карту.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-slate-700 px-6 py-4 text-center shadow-lg shadow-teal-900/20">
        <span className="text-2xl">{map.emoji}</span>
        <span className="text-lg font-bold text-white">{map.title}</span>
      </div>

      <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {map.branches.map((branch, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
            <div
              className={`w-full rounded-2xl border p-4 shadow-sm ${BRANCH_STYLES[i % BRANCH_STYLES.length]}`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-xl">{branch.emoji}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {branch.title}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {branch.thesis}
              </p>

              {branch.children.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-black/5 pt-3 dark:border-white/5">
                  {branch.children.map((child, j) => (
                    <li key={j} className="text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {child.title}:
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {child.thesis}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
