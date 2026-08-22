export type ThemeId =
  | "teal"
  | "sky"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose";

export const THEME_IDS: ThemeId[] = [
  "teal",
  "sky",
  "indigo",
  "emerald",
  "amber",
  "rose",
];

type Theme = {
  label: string;
  swatch: string;
  gradient: string;
  headingClass: string;
  codeClass: string;
  nodeGradient: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  teal: {
    label: "Бірюзовий",
    swatch: "bg-teal-500",
    gradient: "from-teal-600 to-slate-700",
    headingClass:
      "prose-h2:text-teal-700 dark:prose-h2:text-teal-400",
    codeClass:
      "prose-code:bg-teal-50 prose-code:text-teal-700 dark:prose-code:bg-teal-950/50 dark:prose-code:text-teal-300",
    nodeGradient: "from-teal-500 to-teal-600",
  },
  sky: {
    label: "Небесний",
    swatch: "bg-sky-500",
    gradient: "from-sky-600 to-slate-700",
    headingClass:
      "prose-h2:text-sky-700 dark:prose-h2:text-sky-400",
    codeClass:
      "prose-code:bg-sky-50 prose-code:text-sky-700 dark:prose-code:bg-sky-950/50 dark:prose-code:text-sky-300",
    nodeGradient: "from-sky-500 to-sky-600",
  },
  indigo: {
    label: "Індиго",
    swatch: "bg-indigo-500",
    gradient: "from-indigo-600 to-slate-700",
    headingClass:
      "prose-h2:text-indigo-700 dark:prose-h2:text-indigo-400",
    codeClass:
      "prose-code:bg-indigo-50 prose-code:text-indigo-700 dark:prose-code:bg-indigo-950/50 dark:prose-code:text-indigo-300",
    nodeGradient: "from-indigo-500 to-indigo-600",
  },
  emerald: {
    label: "Смарагдовий",
    swatch: "bg-emerald-500",
    gradient: "from-emerald-600 to-slate-700",
    headingClass:
      "prose-h2:text-emerald-700 dark:prose-h2:text-emerald-400",
    codeClass:
      "prose-code:bg-emerald-50 prose-code:text-emerald-700 dark:prose-code:bg-emerald-950/50 dark:prose-code:text-emerald-300",
    nodeGradient: "from-emerald-500 to-emerald-600",
  },
  amber: {
    label: "Бурштиновий",
    swatch: "bg-amber-500",
    gradient: "from-amber-600 to-slate-700",
    headingClass:
      "prose-h2:text-amber-700 dark:prose-h2:text-amber-400",
    codeClass:
      "prose-code:bg-amber-50 prose-code:text-amber-700 dark:prose-code:bg-amber-950/50 dark:prose-code:text-amber-300",
    nodeGradient: "from-amber-500 to-amber-600",
  },
  rose: {
    label: "Рожевий",
    swatch: "bg-rose-500",
    gradient: "from-rose-600 to-slate-700",
    headingClass:
      "prose-h2:text-rose-700 dark:prose-h2:text-rose-400",
    codeClass:
      "prose-code:bg-rose-50 prose-code:text-rose-700 dark:prose-code:bg-rose-950/50 dark:prose-code:text-rose-300",
    nodeGradient: "from-rose-500 to-rose-600",
  },
};

const BRANCH_ROTATION: ThemeId[] = [
  "sky",
  "indigo",
  "emerald",
  "amber",
  "rose",
  "teal",
];

export function getTheme(id: string | null | undefined): Theme {
  return THEMES[(id as ThemeId) in THEMES ? (id as ThemeId) : "teal"];
}

export function getBranchGradients(mainTheme: string | null | undefined) {
  const main = (mainTheme as ThemeId) in THEMES ? (mainTheme as ThemeId) : "teal";
  const rest = BRANCH_ROTATION.filter((id) => id !== main);
  return [main, ...rest].map((id) => THEMES[id].nodeGradient);
}
