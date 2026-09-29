interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: string;
}

export default function ProgressBar({ value, className = '', color = 'bg-blue-500' }: ProgressBarProps) {
  return (
    <div className={`h-2 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
