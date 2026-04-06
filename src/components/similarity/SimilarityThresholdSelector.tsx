import { useCallback, useState } from 'react';
import { Slider } from '@/components/ui/ui/slider';
import { Button } from '@/components/ui/ui/button';
import { cn } from '@/lib/utils';
import { THRESHOLD_PRESETS } from '@/types/similarity';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface SimilarityThresholdSelectorProps {
  value: number;
  onChange: (value: number) => void;
  status?: 'idle' | 'running' | 'done' | 'error';
  clustersFound?: number;
  className?: string;
  compact?: boolean;
}

export function SimilarityThresholdSelector({
  value,
  onChange,
  status = 'idle',
  clustersFound = 0,
  className,
  compact = false,
}: SimilarityThresholdSelectorProps) {
  const [isCustom, setIsCustom] = useState(
    !THRESHOLD_PRESETS.some((p) => p.value === value)
  );

  const handlePreset = useCallback(
    (preset: number) => {
      setIsCustom(false);
      onChange(preset);
    },
    [onChange]
  );

  const handleSlider = useCallback(
    (val: number[]) => {
      setIsCustom(true);
      onChange(val[0] / 100);
    },
    [onChange]
  );

  const pct = Math.round(value * 100);

  return (
    <div className={cn('space-y-2', className)}>
      {!compact && (
        <label className="text-xs font-medium text-muted-foreground">
          Similarity threshold
        </label>
      )}

      <div className="flex items-center gap-1.5">
        {THRESHOLD_PRESETS.map((p) => (
          <Button
            key={p.label}
            variant={!isCustom && value === p.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs px-2.5"
            onClick={() => handlePreset(p.value)}
            aria-label={`Set threshold to ${p.label} (${Math.round(p.value * 100)}%)`}
          >
            {p.label} {Math.round(p.value * 100)}%
          </Button>
        ))}
        <Button
          variant={isCustom ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs px-2.5"
          onClick={() => setIsCustom(true)}
          aria-label="Set custom threshold"
        >
          Custom
        </Button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-3">
          <Slider
            value={[pct]}
            onValueChange={handleSlider}
            min={50}
            max={99}
            step={1}
            className="flex-1"
            aria-label="Similarity threshold percentage"
          />
          <span className="text-xs font-mono font-medium tabular-nums w-8 text-right">
            {pct}%
          </span>
        </div>
      )}

      {/* Status line */}
      <div className="flex items-center gap-1.5 text-xs min-h-[20px]">
        {status === 'running' && (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-muted-foreground">
              Checking similarity at {pct}%...
            </span>
          </>
        )}
        {status === 'done' && clustersFound > 0 && (
          <span className="text-warning font-medium">
            {clustersFound} similar {clustersFound === 1 ? 'group' : 'groups'} found
          </span>
        )}
        {status === 'done' && clustersFound === 0 && (
          <span className="text-success flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            No duplicates detected
          </span>
        )}
      </div>
    </div>
  );
}
