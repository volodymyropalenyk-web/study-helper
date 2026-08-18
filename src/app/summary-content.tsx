import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SummaryContent({ text }: { text: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-6 prose-h2:mb-2 prose-h2:text-teal-700 prose-strong:text-slate-900 prose-li:my-0.5 dark:prose-invert dark:prose-h2:text-teal-400 dark:prose-strong:text-slate-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
