type Child = { title: string; thesis: string };
type Branch = {
  title: string;
  emoji: string;
  thesis: string;
  children: Child[];
};
type Mindmap = { title: string; emoji: string; branches: Branch[] };

const NODE_COLORS = [
  "from-teal-500 to-teal-600",
  "from-sky-500 to-sky-600",
  "from-indigo-500 to-indigo-600",
  "from-emerald-500 to-emerald-600",
  "from-cyan-500 to-cyan-600",
  "from-slate-500 to-slate-600",
];

const SIZE = 1000;
const CENTER = SIZE / 2;
const BRANCH_RADIUS = 320;
const CHILD_RADIUS = 460;

function toXY(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

function pct(value: number) {
  return `${(value / SIZE) * 100}%`;
}

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

  const branchCount = map.branches.length;
  const branchAngleStep = 360 / branchCount;

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const branchPositions = map.branches.map((branch, i) => {
    const angle = -90 + i * branchAngleStep;
    const pos = toXY(angle, BRANCH_RADIUS);
    lines.push({ x1: CENTER, y1: CENTER, x2: pos.x, y2: pos.y });

    const childCount = branch.children.length;
    const childSpread = 34;
    const childPositions = branch.children.map((_, j) => {
      const offset =
        childCount === 1
          ? 0
          : -childSpread / 2 + (childSpread / (childCount - 1)) * j;
      const childAngle = angle + offset;
      const cpos = toXY(childAngle, CHILD_RADIUS);
      lines.push({ x1: pos.x, y1: pos.y, x2: cpos.x, y2: cpos.y });
      return cpos;
    });

    return { angle, pos, childPositions };
  });

  return (
    <div className="overflow-x-auto">
      <div
        className="relative mx-auto aspect-square w-full min-w-[600px] max-w-[820px]"
        style={{ minHeight: 600 }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <marker
              id="mm-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M0,0 L10,5 L0,10 z"
                className="fill-slate-400 dark:fill-slate-500"
              />
            </marker>
          </defs>
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={3}
              markerEnd="url(#mm-arrow)"
            />
          ))}
        </svg>

        {/* Central node */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: pct(CENTER), top: pct(CENTER), width: "18%" }}
        >
          <div className="flex aspect-square w-full items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-slate-700 text-4xl shadow-lg shadow-teal-900/30 ring-4 ring-white dark:ring-slate-900">
            {map.emoji}
          </div>
          <div className="mt-2 rounded-lg bg-slate-900 px-2.5 py-1 text-center text-xs font-bold text-white shadow-md dark:bg-slate-700">
            {map.title}
          </div>
        </div>

        {/* Branch nodes */}
        {map.branches.map((branch, i) => {
          const { pos, childPositions } = branchPositions[i];
          const color = NODE_COLORS[i % NODE_COLORS.length];
          return (
            <div key={i}>
              <div
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: pct(pos.x), top: pct(pos.y), width: "13%" }}
              >
                <div
                  className={`flex aspect-square w-full items-center justify-center rounded-full bg-gradient-to-br ${color} text-2xl shadow-md ring-4 ring-white dark:ring-slate-900`}
                >
                  {branch.emoji}
                </div>
                <div className="mt-1.5 max-w-[9rem] rounded-lg border border-card-border bg-card px-2 py-1 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {branch.title}
                  </div>
                  <div className="text-[10px] leading-tight text-slate-600 dark:text-slate-400">
                    {branch.thesis}
                  </div>
                </div>
              </div>

              {branch.children.map((child, j) => {
                const cpos = childPositions[j];
                return (
                  <div
                    key={j}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{ left: pct(cpos.x), top: pct(cpos.y), width: "10%" }}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${color} ring-2 ring-white dark:ring-slate-900`}
                    />
                    <div className="mt-1 max-w-[7rem] rounded-md border border-card-border bg-card px-1.5 py-1 text-center shadow-sm backdrop-blur-sm">
                      <div className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                        {child.title}
                      </div>
                      <div className="text-[9px] leading-tight text-slate-500 dark:text-slate-500">
                        {child.thesis}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
