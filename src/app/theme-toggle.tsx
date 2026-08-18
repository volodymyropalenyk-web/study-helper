"use client";

export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Перемкнути тему"
      className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-card text-lg shadow-md shadow-black/5 backdrop-blur-sm transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
