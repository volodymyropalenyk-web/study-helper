import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTheme } from "@/lib/color-themes";

export function SummaryContent({
  text,
  color,
}: {
  text: string;
  color?: string;
}) {
  const theme = getTheme(color);
  return (
    <div
      className={`animate-fade-in-up rounded-3xl border p-6 shadow-xl shadow-black/5 backdrop-blur-sm ${theme.cardClass}`}
    >
      <div
        className={`prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-6 prose-h2:mb-2 prose-strong:text-slate-900 prose-li:my-0.5 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-strong:text-slate-100 ${theme.headingClass} ${theme.codeClass} ${theme.markerClass}`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
