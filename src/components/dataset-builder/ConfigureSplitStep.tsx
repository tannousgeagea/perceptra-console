import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Label } from '@/components/ui/ui/label';
import { Slider } from '@/components/ui/ui/slider';
import { Card } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { SplitRatios, SPLIT_PRESETS } from '@/types/split';
import { useSplitDataset } from '@/hooks/useProjectImageUpdate';

interface ConfigureSplitStepProps {
  projectId: string;
  finalizedCount: number;
  onComplete: () => void;
  onBack: () => void;
}

export function ConfigureSplitStep({ projectId, finalizedCount, onComplete, onBack }: ConfigureSplitStepProps) {
  const [ratios, setRatios] = useState<SplitRatios>({
    train_ratio: 0.7,
    val_ratio: 0.2,
    test_ratio: 0.1
  });

  const { mutateAsync: splitDataset, isPending } = useSplitDataset(projectId, {
    onSuccess: (data) => {
      toast.success(
        `Split ${data.total_split} images: Train=${data.train_count}, Val=${data.val_count}, Test=${data.test_count}`
      );
      if (data.already_split > 0) {
        toast.info(`${data.already_split} images were already split`);
      }
    },
  });

  // Auto-adjust to ensure ratios sum to 1.0
  const adjustRatios = (newRatios: Partial<SplitRatios>) => {
    const updated = { ...ratios, ...newRatios };
    const total = updated.train_ratio + updated.val_ratio + updated.test_ratio;
    
    if (Math.abs(total - 1.0) < 0.01) {
      setRatios(updated);
    } else {
      // Normalize to sum to 1.0
      const factor = 1.0 / total;
      setRatios({
        train_ratio: parseFloat((updated.train_ratio * factor).toFixed(2)),
        val_ratio: parseFloat((updated.val_ratio * factor).toFixed(2)),
        test_ratio: parseFloat((updated.test_ratio * factor).toFixed(2))
      });
    }
  };

  const handlePresetSelect = (preset: typeof SPLIT_PRESETS[0]) => {
    setRatios(preset.ratios);
  };

  const handleSplit = async () => {
    try {
      const response = await splitDataset(ratios);
      toast.success(response.message);
      
      onComplete();
    } catch (error: any) {
      toast.error("Failed to split dataset. Please try again.");
    }
  };

  const estimatedCounts = {
    train: Math.floor(finalizedCount * ratios.train_ratio),
    val: Math.floor(finalizedCount * ratios.val_ratio),
    test: Math.floor(finalizedCount * ratios.test_ratio)
  };

  const total = ratios.train_ratio + ratios.val_ratio + ratios.test_ratio;
  const isValidTotal = Math.abs(total - 1.0) < 0.01;

  return (
    <div className="space-y-6 py-4">
      {/* Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label className="text-base font-semibold">Quick Presets</Label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPLIT_PRESETS.map((preset) => (
            <Card
              key={preset.name}
              className="p-4 cursor-pointer hover:border-primary transition-all hover:shadow-md"
              onClick={() => handlePresetSelect(preset)}
            >
              <h4 className="font-semibold mb-1">{preset.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-success">Train:</span>
                  <span className="font-medium">{(preset.ratios.train_ratio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary">Val:</span>
                  <span className="font-medium">{(preset.ratios.val_ratio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-warning">Test:</span>
                  <span className="font-medium">{(preset.ratios.test_ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Split Configuration */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Custom Split Ratios</Label>
        
        {/* Train Slider */}
        <div className="space-y-2 p-4 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center justify-between">
            <Label className="text-success font-medium">Training Set</Label>
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              {(ratios.train_ratio * 100).toFixed(0)}% ({estimatedCounts.train} images)
            </Badge>
          </div>
          <Slider
            value={[ratios.train_ratio * 100]}
            onValueChange={([val]) => adjustRatios({ train_ratio: val / 100 })}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-success [&_[role=slider]]:border-success"
          />
        </div>

        {/* Val Slider */}
        <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <Label className="text-primary font-medium">Validation Set</Label>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {(ratios.val_ratio * 100).toFixed(0)}% ({estimatedCounts.val} images)
            </Badge>
          </div>
          <Slider
            value={[ratios.val_ratio * 100]}
            onValueChange={([val]) => adjustRatios({ val_ratio: val / 100 })}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>

        {/* Test Slider */}
        <div className="space-y-2 p-4 rounded-lg bg-warning/5 border border-warning/20">
          <div className="flex items-center justify-between">
            <Label className="text-warning font-medium">Test Set</Label>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              {(ratios.test_ratio * 100).toFixed(0)}% ({estimatedCounts.test} images)
            </Badge>
          </div>
          <Slider
            value={[ratios.test_ratio * 100]}
            onValueChange={([val]) => adjustRatios({ test_ratio: val / 100 })}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-warning [&_[role=slider]]:border-warning"
          />
        </div>
      </div>

      {/* Visual Preview */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Split Distribution Preview</Label>
        <div className="flex h-8 rounded-lg overflow-hidden border">
          <div 
            className="bg-success flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ width: `${ratios.train_ratio * 100}%` }}
          >
            {ratios.train_ratio * 100 > 10 && `${(ratios.train_ratio * 100).toFixed(0)}%`}
          </div>
          <div 
            className="bg-primary flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ width: `${ratios.val_ratio * 100}%` }}
          >
            {ratios.val_ratio * 100 > 10 && `${(ratios.val_ratio * 100).toFixed(0)}%`}
          </div>
          <div 
            className="bg-warning flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{ width: `${ratios.test_ratio * 100}%` }}
          >
            {ratios.test_ratio * 100 > 10 && `${(ratios.test_ratio * 100).toFixed(0)}%`}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-muted-foreground">Total: {(total * 100).toFixed(0)}%</span>
          {!isValidTotal && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>Ratios must sum to 100%</span>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSplit} disabled={isPending || !isValidTotal} size="lg">
          {isPending ? 'Splitting Dataset...' : 'Split Dataset'}
        </Button>
      </div>
    </div>
  );
}
