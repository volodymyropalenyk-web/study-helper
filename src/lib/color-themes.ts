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
  markerClass: string;
  cardClass: string;
  connectorClass: string;
  connectorBorderClass: string;
  nodeGradient: string;
  exportBg: string;
  hexAccent: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  teal: {
    label: "Бірюзовий",
    swatch: "bg-teal-500",
    gradient: "from-teal-600 to-slate-700",
    headingClass: "prose-h2:text-teal-700 dark:prose-h2:text-teal-400",
    codeClass:
      "prose-code:bg-teal-100 prose-code:text-teal-800 dark:prose-code:bg-teal-950/60 dark:prose-code:text-teal-300",
    markerClass: "prose-li:marker:text-teal-500 dark:prose-li:marker:text-teal-500",
    cardClass:
      "border-teal-200 bg-teal-50 dark:border-teal-800/60 dark:bg-teal-950/40",
    connectorClass: "bg-teal-300 dark:bg-teal-700",
    connectorBorderClass: "border-teal-300 dark:border-teal-700",
    nodeGradient: "from-teal-500 to-teal-600",
    exportBg: "#f0fdfa",
    hexAccent: "#0d9488",
  },
  sky: {
    label: "Небесний",
    swatch: "bg-sky-500",
    gradient: "from-sky-600 to-slate-700",
    headingClass: "prose-h2:text-sky-700 dark:prose-h2:text-sky-400",
    codeClass:
      "prose-code:bg-sky-100 prose-code:text-sky-800 dark:prose-code:bg-sky-950/60 dark:prose-code:text-sky-300",
    markerClass: "prose-li:marker:text-sky-500 dark:prose-li:marker:text-sky-500",
    cardClass:
      "border-sky-200 bg-sky-50 dark:border-sky-800/60 dark:bg-sky-950/40",
    connectorClass: "bg-sky-300 dark:bg-sky-700",
    connectorBorderClass: "border-sky-300 dark:border-sky-700",
    nodeGradient: "from-sky-500 to-sky-600",
    exportBg: "#f0f9ff",
    hexAccent: "#0284c7",
  },
  indigo: {
    label: "Індиго",
    swatch: "bg-indigo-500",
    gradient: "from-indigo-600 to-slate-700",
    headingClass: "prose-h2:text-indigo-700 dark:prose-h2:text-indigo-400",
    codeClass:
      "prose-code:bg-indigo-100 prose-code:text-indigo-800 dark:prose-code:bg-indigo-950/60 dark:prose-code:text-indigo-300",
    markerClass:
      "prose-li:marker:text-indigo-500 dark:prose-li:marker:text-indigo-500",
    cardClass:
      "border-indigo-200 bg-indigo-50 dark:border-indigo-800/60 dark:bg-indigo-950/40",
    connectorClass: "bg-indigo-300 dark:bg-indigo-700",
    connectorBorderClass: "border-indigo-300 dark:border-indigo-700",
    nodeGradient: "from-indigo-500 to-indigo-600",
    exportBg: "#eef2ff",
    hexAccent: "#4f46e5",
  },
  emerald: {
    label: "Смарагдовий",
    swatch: "bg-emerald-500",
    gradient: "from-emerald-600 to-slate-700",
    headingClass: "prose-h2:text-emerald-700 dark:prose-h2:text-emerald-400",
    codeClass:
      "prose-code:bg-emerald-100 prose-code:text-emerald-800 dark:prose-code:bg-emerald-950/60 dark:prose-code:text-emerald-300",
    markerClass:
      "prose-li:marker:text-emerald-500 dark:prose-li:marker:text-emerald-500",
    cardClass:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40",
    connectorClass: "bg-emerald-300 dark:bg-emerald-700",
    connectorBorderClass: "border-emerald-300 dark:border-emerald-700",
    nodeGradient: "from-emerald-500 to-emerald-600",
    exportBg: "#ecfdf5",
    hexAccent: "#059669",
  },
  amber: {
    label: "Бурштиновий",
    swatch: "bg-amber-500",
    gradient: "from-amber-600 to-slate-700",
    headingClass: "prose-h2:text-amber-700 dark:prose-h2:text-amber-400",
    codeClass:
      "prose-code:bg-amber-100 prose-code:text-amber-800 dark:prose-code:bg-amber-950/60 dark:prose-code:text-amber-300",
    markerClass:
      "prose-li:marker:text-amber-500 dark:prose-li:marker:text-amber-500",
    cardClass:
      "border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40",
    connectorClass: "bg-amber-300 dark:bg-amber-700",
    connectorBorderClass: "border-amber-300 dark:border-amber-700",
    nodeGradient: "from-amber-500 to-amber-600",
    exportBg: "#fffbeb",
    hexAccent: "#d97706",
  },
  rose: {
    label: "Рожевий",
    swatch: "bg-rose-500",
    gradient: "from-rose-600 to-slate-700",
    headingClass: "prose-h2:text-rose-700 dark:prose-h2:text-rose-400",
    codeClass:
      "prose-code:bg-rose-100 prose-code:text-rose-800 dark:prose-code:bg-rose-950/60 dark:prose-code:text-rose-300",
    markerClass: "prose-li:marker:text-rose-500 dark:prose-li:marker:text-rose-500",
    cardClass:
      "border-rose-200 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-950/40",
    connectorClass: "bg-rose-300 dark:bg-rose-700",
    connectorBorderClass: "border-rose-300 dark:border-rose-700",
    nodeGradient: "from-rose-500 to-rose-600",
    exportBg: "#fff1f2",
    hexAccent: "#e11d48",
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
