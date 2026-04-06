import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/ui/sheet';
import { Button } from '@/components/ui/ui/button';
import { SimilarityThresholdSelector } from './SimilarityThresholdSelector';
import { ScanProgressView } from './ScanProgressView';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/ui/tooltip';
import { HASH_ALGORITHMS } from '@/types/similarity';
import type { ScanConfig, ScanJob, HashAlgorithm, ScanScope } from '@/types/similarity';
import { Search, Info } from 'lucide-react';

interface ScanConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ScanConfig;
  onConfigChange: (config: Partial<ScanConfig>) => void;
  activeScan: ScanJob | null;
  onStartScan: () => void;
  onCancelScan: () => void;
  showScopeToggle?: boolean;
}

export function ScanConfigDrawer({
  open,
  onOpenChange,
  config,
  onConfigChange,
  activeScan,
  onStartScan,
  onCancelScan,
  showScopeToggle = false,
}: ScanConfigDrawerProps) {
  const isScanning = activeScan && (activeScan.status === 'running' || activeScan.status === 'queued');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Similarity Scan
          </SheetTitle>
          <SheetDescription>
            Find duplicate and near-duplicate images
          </SheetDescription>
        </SheetHeader>

        {isScanning ? (
          <ScanProgressView scan={activeScan!} onCancel={onCancelScan} />
        ) : (
          <div className="flex-1 space-y-6 py-4">
            {/* Threshold */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Similarity threshold</Label>
              <SimilarityThresholdSelector
                value={config.threshold}
                onChange={(t) => onConfigChange({ threshold: t })}
              />
            </div>

            {/* Scope */}
            {showScopeToggle && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Scope</Label>
                <RadioGroup
                  value={config.scope}
                  onValueChange={(v) => onConfigChange({ scope: v as ScanScope })}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="datalake" id="scope-datalake" />
                    <Label htmlFor="scope-datalake" className="text-sm cursor-pointer">
                      Entire datalake
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dataset" id="scope-dataset" />
                    <Label htmlFor="scope-dataset" className="text-sm cursor-pointer">
                      This dataset only
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Hash Algorithm */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hash algorithm</Label>
              <Select
                value={config.algorithm}
                onValueChange={(v) => onConfigChange({ algorithm: v as HashAlgorithm })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HASH_ALGORITHMS.map((algo) => (
                    <SelectItem key={algo.value} value={algo.value}>
                      {algo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                      <Info className="w-3 h-3" />
                      {HASH_ALGORITHMS.find((a) => a.value === config.algorithm)?.description}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">
                    <p><strong>ahash:</strong> Fastest, general purpose</p>
                    <p><strong>phash:</strong> Slower, robust to edits</p>
                    <p><strong>dhash:</strong> Good for crops/rotations</p>
                    <p><strong>whash:</strong> Handles compression well</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isScanning && (
          <div className="flex flex-col gap-2 pt-4 border-t mt-auto">
            <Button onClick={onStartScan} className="w-full gap-2">
              <Search className="w-4 h-4" />
              Run Scan
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
