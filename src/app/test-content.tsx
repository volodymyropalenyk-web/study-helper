"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function TestContent({ resultText }: { resultText: string }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  let questions: Question[] = [];
  try {
    questions = JSON.parse(resultText).questions ?? [];
  } catch {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Не вдалося прочитати тест.
      </p>
    );
  }

  const score = questions.reduce(
    (acc, q, i) => acc + (normalize(answers[i] ?? "") === normalize(q.answer) ? 1 : 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      {checked && (
        <div className="rounded-2xl bg-teal-50 p-4 text-center text-sm font-semibold text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
          Результат: {score} із {questions.length}
        </div>
      )}

      {questions.map((q, i) => {
        const isCorrect = normalize(answers[i] ?? "") === normalize(q.answer);
        return (
          <div key={i} className="border-b border-card-border pb-5 last:border-0">
            <p className="mb-3 font-medium text-slate-900 dark:text-slate-100">
              {i + 1}. {q.question}
            </p>

            {q.options.length > 0 ? (
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => {
                  const selected = answers[i] === opt;
                  const showCorrect = checked && opt === q.answer;
                  const showWrong = checked && selected && opt !== q.answer;
                  return (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        showCorrect
                          ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/40"
                          : showWrong
                            ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                            : selected
                              ? "border-teal-300 bg-teal-50/50 dark:border-teal-700 dark:bg-teal-950/20"
                              : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${i}`}
                        disabled={checked}
                        checked={selected}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [i]: opt }))
                        }
                      />
                      <span className="text-slate-800 dark:text-slate-200">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  disabled={checked}
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                  }
                  placeholder="Твоя відповідь..."
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-colors ${
                    checked
                      ? isCorrect
                        ? "border-teal-400 bg-teal-50 dark:border-teal-600 dark:bg-teal-950/40"
                        : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      : "border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800/60"
                  } text-slate-900 dark:text-slate-100`}
                />
                {checked && !isCorrect && (
                  <p className="mt-1 text-xs text-teal-700 dark:text-teal-400">
                    Правильна відповідь: {q.answer}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!checked && (
        <button
          onClick={() => setChecked(true)}
          className="rounded-xl bg-gradient-to-r from-teal-600 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
        >
          Перевірити
        </button>
      )}
    </div>
  );
}
