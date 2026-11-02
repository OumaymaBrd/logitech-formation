type Props = {
  value: number;
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, className = "", showLabel = false }: Props) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs font-medium text-brand-700">
          <span>Progression</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-700 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
