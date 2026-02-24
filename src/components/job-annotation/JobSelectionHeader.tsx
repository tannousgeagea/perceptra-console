import { useState } from 'react';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Progress } from '@/components/ui/ui/progress';
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
import { X, CheckCircle2, Trash2, Eye, Loader2 } from 'lucide-react';

export type BulkOperation = {
  type: 'review' | 'delete';
  total: number;
  processed: number;
  failed: number;
  status: 'idle' | 'running' | 'done' | 'cancelled';
};

interface JobSelectionHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkReview: () => void;
  onBulkDelete: () => void;
  bulkOperation: BulkOperation | null;
  onCancelOperation: () => void;
}

export function JobSelectionHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkReview,
  onBulkDelete,
  bulkOperation,
  onCancelOperation,
}: JobSelectionHeaderProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  if (selectedCount === 0 && !bulkOperation) return null;
  const progress = bulkOperation
    ? Math.round((bulkOperation.processed / bulkOperation.total) * 100)
    : 0;
  return (
    <>
      {/* Selection bar */}
      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{selectedCount}</span>
            <span className="text-primary-foreground/80">
              of {totalCount} {totalCount === 1 ? 'image' : 'images'} selected
            </span>
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
          <Button
            size="sm"
            variant="secondary"
            onClick={onBulkReview}
            className="gap-2"
            disabled={bulkOperation?.status === 'running'}
          >
            <CheckCircle2 className="w-4 h-4" />
            Review Selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-2"
            disabled={bulkOperation?.status === 'running'}
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </Button>
        </div>
      </div>
      {/* Progress overlay */}
      {bulkOperation && bulkOperation.status !== 'idle' && (
        <div className="border rounded-lg p-4 bg-card shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {bulkOperation.status === 'running' ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : bulkOperation.status === 'done' ? (
                <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {bulkOperation.type === 'review' ? 'Reviewing' : 'Deleting'} images
                  {bulkOperation.status === 'done' && ' — Complete'}
                  {bulkOperation.status === 'cancelled' && ' — Cancelled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bulkOperation.processed} of {bulkOperation.total} processed
                  {bulkOperation.failed > 0 && (
                    <span className="text-destructive ml-2">
                      ({bulkOperation.failed} failed)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="tabular-nums">
                {progress}%
              </Badge>
              {bulkOperation.status === 'running' && (
                <Button variant="outline" size="sm" onClick={onCancelOperation}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          {bulkOperation.status === 'running' && (
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
                Success: {bulkOperation.processed - bulkOperation.failed}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                Failed: {bulkOperation.failed}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                Remaining: {bulkOperation.total - bulkOperation.processed}
              </span>
            </div>
          )}
        </div>
      )}
      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} images?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected images and all their annotations will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowDeleteConfirm(false);
                onBulkDelete();
              }}
            >
              Delete {selectedCount} images
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}