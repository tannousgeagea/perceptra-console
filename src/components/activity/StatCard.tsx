import { TrendingUp, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "primary",
}: StatCardProps) => {
  const variantClasses = {
    primary: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
