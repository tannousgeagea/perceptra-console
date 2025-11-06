
import { 
  Bike,
  ChartCandlestick,
  FlaskConical
} from "lucide-react";
import { Badge } from '@/components/ui/ui/badge';
import { SplitType } from "@/types/split";

export const getSplitBadgeVariant = (split: SplitType) => {
    switch (split) {
      case 'train': return 'default';
      case 'valid': return 'secondary';
      case 'test': return 'outline';
      default: return 'default';
    }
  };

export const getSplitColor = (split: SplitType) => {
    switch (split) {
      case 'train': return 'text-success';
      case 'valid': return 'text-primary';
      case 'test': return 'text-warning';
      default: return 'text-foreground';
    }
  };

export const getModeBadge = (split: SplitType) => {
  if (!split) return null;

  const modeConfig = {
    train: { label: 'Train', className: 'bg-blue-500', icon: Bike },
    valid: { label: 'Val', className: 'bg-purple-500', icon: ChartCandlestick },
    test: { label: 'Test', className: 'bg-orange-500', icon: FlaskConical },
  };

  const config = modeConfig[split];
  if (!config) return null;

  const Icon = config.icon;
  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};