import { useAutoAnnotate } from '@/hooks/useAutoAnnotate';
import { ImageSelectionStep } from '@/components/auto-annotate/ImageSelectionStep';
import { ConfigureStep } from '@/components/auto-annotate/ConfigureStep';
import { ConfirmStep } from '@/components/auto-annotate/ConfirmStep';
import { ProcessingStep } from '@/components/auto-annotate/ProcessingStep';
import { ReviewStep } from '@/components/auto-annotate/ReviewStep';
import { CompletionSummary } from '@/components/auto-annotate/CompletionSummary';
import { ActivityLog } from '@/components/auto-annotate/ActivityLog';
import { Badge } from '@/components/ui/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { Wand2, ScrollText } from 'lucide-react';

export default function AutoAnnotate() {
  const state = useAutoAnnotate();

  const stepLabel: Record<string, string> = {
    select: 'Select Images',
    configure: 'Configure',
    confirm: 'Confirm',
    processing: 'Processing',
    review: 'Review',
    complete: 'Complete',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Auto-Annotate
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use AI models to automatically generate annotations for your images.
          </p>
        </div>

        <Tabs defaultValue="annotate">
          <TabsList>
            <TabsTrigger value="annotate" className="gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Annotate
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-1.5">
              <ScrollText className="h-3.5 w-3.5" /> Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="annotate" className="mt-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {['select', 'configure', 'confirm', 'processing', 'complete'].map((s, i) => {
                const steps = ['select', 'configure', 'confirm', 'processing', 'complete'];
                const currentStepIdx = steps.indexOf(state.step === 'review' ? 'complete' : state.step);
                const thisIdx = i;
                const isActive = thisIdx === currentStepIdx;
                const isDone = thisIdx < currentStepIdx;

                return (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && (
                      <div className={`h-px w-6 ${isDone ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    <Badge
                      variant={isActive ? 'default' : isDone ? 'default' : 'secondary'}
                      className={`text-xs ${isDone ? 'bg-emerald-500 text-white' : ''}`}
                    >
                      {i + 1}. {stepLabel[s]}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Steps */}
            {state.step === 'select' && (
              <ImageSelectionStep
                images={state.filteredImages}
                selectedIds={state.selectedIds}
                totalSizeMb={state.totalSizeMb}
                searchQuery={state.searchQuery}
                tagFilter={state.tagFilter}
                statusFilter={state.statusFilter}
                allTags={state.allTags}
                onSearchChange={state.setSearchQuery}
                onTagFilterChange={state.setTagFilter}
                onStatusFilterChange={state.setStatusFilter}
                onToggle={state.toggleSelect}
                onSelectAll={state.selectAll}
                onDeselectAll={state.deselectAll}
                onNext={() => state.setStep('configure')}
              />
            )}

            {state.step === 'configure' && (
              <ConfigureStep
                models={state.models}
                selectedModel={state.selectedModel}
                onSelectModel={state.setSelectedModel}
                labels={state.labels}
                labelPresets={state.labelPresets}
                onAddLabel={state.addLabel}
                onRemoveLabel={state.removeLabel}
                onBack={() => state.setStep('select')}
                onNext={() => state.setStep('confirm')}
              />
            )}

            {state.step === 'confirm' && state.selectedModel && (
              <ConfirmStep
                selectedImages={state.selectedImages}
                model={state.selectedModel}
                labels={state.labels}
                totalSizeMb={state.totalSizeMb}
                onBack={() => state.setStep('configure')}
                onStart={state.startProcessing}
              />
            )}

            {state.step === 'processing' && state.session && (
              <ProcessingStep
                session={state.session}
                onPause={state.pauseProcessing}
                onResume={state.resumeProcessing}
                onCancel={state.cancelProcessing}
              />
            )}

            {state.step === 'review' && (
              <ReviewStep
                annotations={state.generatedAnnotations}
                confidenceThreshold={state.confidenceThreshold}
                onConfidenceChange={state.setConfidenceThreshold}
                onUpdateStatus={state.updateAnnotationStatus}
                onBulkAccept={state.bulkAcceptAbove}
                onBulkReject={state.bulkRejectBelow}
                onDone={() => state.setStep('complete')}
              />
            )}

            {state.step === 'complete' && state.session && (
              <CompletionSummary
                session={state.session}
                annotations={state.generatedAnnotations}
                onReview={() => state.setStep('review')}
                onNewSession={state.reset}
              />
            )}
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <ActivityLog entries={state.activityLog} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
