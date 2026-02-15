import { Card, CardContent } from "@/components/ui/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  change: number;
  isPercentage?: boolean;
  isInverse?: boolean; // For metrics where higher is worse (e.g., edit rate)
  onClick?: () => void;
}

const getMetricColor = (value: number, isInverse: boolean = false) => {
  const threshold = isInverse ? value : 1 - value;
  if (threshold < 0.2) return "text-green-600 dark:text-green-400";
  if (threshold < 0.4) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export const KPICard = ({
  title,
  value,
  change,
  isPercentage = true,
  isInverse = false,
  onClick,
}: KPICardProps) => {
  const isPositiveChange = isInverse ? change < 0 : change > 0;
  const displayValue = isPercentage ? `${(value * 100).toFixed(1)}%` : value.toLocaleString();
  const displayChange = `${change > 0 ? "+" : ""}${(change * 100).toFixed(1)}%`;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        "bg-card"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-end justify-between mt-2">
          <p className={cn("text-2xl font-bold", getMetricColor(value, isInverse))}>
            {displayValue}
          </p>
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              isPositiveChange
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositiveChange ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {displayChange}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
