import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function SummaryContent({ text }: { text: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-6 prose-h2:mb-2 prose-h2:text-teal-700 prose-strong:text-slate-900 prose-li:my-0.5 prose-code:rounded-md prose-code:bg-teal-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:font-semibold prose-code:text-teal-700 prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-h2:text-teal-400 dark:prose-strong:text-slate-100 dark:prose-code:bg-teal-950/50 dark:prose-code:text-teal-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
