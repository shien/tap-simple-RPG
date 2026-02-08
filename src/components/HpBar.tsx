export function HpBar({
  current,
  max,
  label,
  colorClass,
}: {
  current: bigint;
  max: bigint;
  label?: string;
  colorClass?: string;
}) {
  const percent = max > 0n ? Number((current * 100n) / max) : 0;
  const clampedPercent = Math.max(0, Math.min(100, percent));

  const defaultColor =
    percent > 50 ? "bg-green-500" : percent > 20 ? "bg-yellow-500" : "bg-red-500";
  const barColor = colorClass ?? defaultColor;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        {label && <span>{label}</span>}
        <span className="ml-auto">
          {current.toString()} / {max.toString()}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-600">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
