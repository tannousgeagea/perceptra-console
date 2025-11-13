interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

export const ProgressBar = ({
  value,
  max,
  label,
  variant = "primary",
}: ProgressBarProps) => {
  const percentage = (value / max) * 100;

  const variantClasses = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {percentage.toFixed(1)}% complete
      </p>
    </div>
  );
};
