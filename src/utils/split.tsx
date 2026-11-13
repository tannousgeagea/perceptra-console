
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
      case 'val': return 'secondary';
      case 'test': return 'outline';
      default: return 'default';
    }
  };

export const getSplitColor = (split: SplitType) => {
    switch (split) {
      case 'train': return 'text-success';
      case 'val': return 'text-primary';
      case 'test': return 'text-warning';
      default: return 'text-foreground';
    }
  };

export const getModeBadge = (split: SplitType) => {
  if (!split) return null;

  // Same split colours as getSplitColor and the version cards: train green,
  // val brand purple, test amber.
  const modeConfig = {
    train: { label: 'Train', className: 'bg-success text-success-foreground hover:bg-success/90', icon: Bike },
    val: { label: 'Val', className: 'bg-primary text-primary-foreground hover:bg-primary/90', icon: ChartCandlestick },
    test: { label: 'Test', className: 'bg-warning text-warning-foreground hover:bg-warning/90', icon: FlaskConical },
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