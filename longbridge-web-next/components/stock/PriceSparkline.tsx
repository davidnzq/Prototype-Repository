// Server-safe SVG sparkline of closing prices. Expects chronological input.

export function PriceSparkline({
  points,
  width = 780,
  height = 140,
  up,
}: {
  points: number[];
  width?: number;
  height?: number;
  up?: boolean;
}) {
  if (points.length === 0) {
    return (
      <div className="flex h-[140px] items-center justify-center text-[11px] text-fg-3">
        无数据
      </div>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / Math.max(1, points.length - 1);
  const ys = points.map((p) => height - ((p - min) / span) * (height - 8) - 4);
  const d = ys
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const areaD =
    d + ` L ${(ys.length - 1) * step} ${height} L 0 ${height} Z`;
  const strokeColor = up ? "var(--up)" : "var(--down)";
  const fillColor = up ? "var(--up-soft)" : "var(--down-soft)";
  const first = points[0];
  const last = points[points.length - 1];
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        <path d={areaD} fill={fillColor} opacity={0.35} />
        <path d={d} fill="none" stroke={strokeColor} strokeWidth={1.6} />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-fg-3">
        <span className="num">起 ${first.toFixed(2)}</span>
        <span className="num">区间 ${min.toFixed(2)} – ${max.toFixed(2)}</span>
        <span className="num">近 ${last.toFixed(2)}</span>
      </div>
    </div>
  );
}
