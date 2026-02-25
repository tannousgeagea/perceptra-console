import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Progress } from '@/components/ui/ui/progress';
import { Input } from '@/components/ui/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
import { X, CheckCircle2, Trash2, Tag, Loader2, AlertTriangle } from 'lucide-react';
import type { BulkOperationState } from '@/hooks/useBulkOperation'

export type BulkOperation = BulkOperationState;

interface BulkAction {
  id: string;
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  requiresConfirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  onClick: () => void;
}
interface BulkOperationBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  bulkOperation: BulkOperationState | null;
  onCancelOperation: () => void;
  /** If provided, shows a "Tag" button that opens a tag dialog */
  onBulkTag?: (tags: string[]) => void;
  extraContent?: ReactNode;
  /** Called when done status should be auto-cleared */
  onOperationComplete?: () => void;
}
export function BulkOperationBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
  bulkOperation,
  onCancelOperation,
  onBulkTag,
  extraContent,
  onOperationComplete
}: BulkOperationBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Auto-clear done/failed/cancelled state after 4s
  useEffect(() => {
    if (bulkOperation && (bulkOperation.status === 'done' || bulkOperation.status === 'failed' || bulkOperation.status === 'cancelled')) {
      const timer = setTimeout(() => {
        onOperationComplete?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [bulkOperation, onOperationComplete]);

  if (selectedCount === 0 && !bulkOperation) return null;
  const progress = bulkOperation
    ? Math.round((bulkOperation.processed / bulkOperation.total) * 100)
    : 0;
  
  const handleTagSubmit = () => {
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0 && onBulkTag) {
      onBulkTag(tags);
      setShowTagDialog(false);
      setTagInput('');
    }
  };

  const isRunning = bulkOperation?.status === 'running';

  return (
    <>
      {/* Selection bar */}
      {selectedCount > 0 && (
        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{selectedCount}</span>
              <span className="text-primary-foreground/80">of {totalCount} selected</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onBulkTag && (
              <Button size="sm" variant="secondary" onClick={() => setShowTagDialog(true)} className="gap-2" disabled={isRunning}>
                <Tag className="w-4 h-4" />
                Tag
              </Button>
            )}
            {actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant || 'secondary'}
                onClick={() => {
                  if (action.requiresConfirm) setConfirmAction(action);
                  else action.onClick();
                }}
                className="gap-2"
                disabled={isRunning}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            {extraContent}
          </div>
        </div>
      )}

      {/* Animated progress overlay */}
      {bulkOperation && bulkOperation.status !== 'idle' && (
        <div className="border rounded-lg p-4 bg-card shadow-sm animate-in fade-in duration-300 overflow-hidden relative">
          {/* Animated shimmer while running */}
          {isRunning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
            </div>
          )}

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              {isRunning ? (
                <div className="relative">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
              ) : bulkOperation.status === 'done' ? (
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ) : bulkOperation.status === 'failed' ? (
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">
                  {bulkOperation.type === 'review'
                    ? 'Reviewing'
                    : bulkOperation.type === 'delete'
                    ? 'Deleting'
                    : 'Tagging'}{' '}
                  {bulkOperation.total} images
                  {bulkOperation.status === 'done' && ' — Complete'}
                  {bulkOperation.status === 'failed' && ' — Failed'}
                  {bulkOperation.status === 'cancelled' && ' — Cancelled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRunning
                    ? `Processing... ${bulkOperation.processed} of ${bulkOperation.total}`
                    : bulkOperation.status === 'done'
                    ? `Successfully processed ${bulkOperation.processed - bulkOperation.failed} of ${bulkOperation.total}`
                    : `${bulkOperation.processed} of ${bulkOperation.total} processed`}
                  {bulkOperation.failed > 0 && (
                    <span className="text-destructive ml-2">({bulkOperation.failed} failed)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={bulkOperation.status === 'done' ? 'default' : 'outline'}
                className={`tabular-nums transition-all duration-300 ${
                  bulkOperation.status === 'done' ? 'bg-green-500/10 text-green-600 border-green-500/30' : ''
                }`}
              >
                {progress}%
              </Badge>
              {isRunning && (
                <Button variant="outline" size="sm" onClick={onCancelOperation}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Progress
              value={progress}
              className={`h-2 transition-all duration-500 ${
                bulkOperation.status === 'done' ? '[&>div]:bg-green-500' : 
                bulkOperation.status === 'failed' ? '[&>div]:bg-destructive' : ''
              }`}
            />
          </div>

          {isRunning && (
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Processed: {bulkOperation.processed}
              </span>
              {bulkOperation.failed > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Failed: {bulkOperation.failed}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                Remaining: ~{bulkOperation.total - bulkOperation.processed}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Delete / destructive confirmation */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || `${confirmAction?.label} ${selectedCount} images?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription ||
                'This action cannot be undone. The selected images will be permanently affected.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                confirmAction?.onClick();
                setConfirmAction(null);
              }}
            >
              {confirmAction?.label} {selectedCount} images
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tag dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tag {selectedCount} images</DialogTitle>
            <DialogDescription>Enter comma-separated tags to apply to the selected images.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. training, validated, outdoor"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTagSubmit()}
          />
          <div className="flex flex-wrap gap-1 min-h-[24px]">
            {tagInput
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTagSubmit}
              disabled={tagInput.split(',').map((t) => t.trim()).filter(Boolean).length === 0}
            >
              <Tag className="w-4 h-4 mr-2" />
              Apply Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}