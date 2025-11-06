import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/ui/dialog';
import { SelectImagesStep } from './SelectImagesStep';
import { ConfigureSplitStep } from './ConfigureSplitStep';
import { Progress } from '@/components/ui/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { ProjectImage } from '@/types/dataset';


interface DatasetBuilderProps {
  projectId: string;
  images: ProjectImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BuilderStep = 'select' | 'split' | 'complete';

export function DatasetBuilder({ projectId, images, open, onOpenChange }: DatasetBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('select');
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);
  const [finalizedCount, setFinalizedCount] = useState(0);

  const handleImagesFinalized = (imageIds: number[], count: number) => {
    setSelectedImageIds(imageIds);
    setFinalizedCount(count);
    setCurrentStep('split');
  };

  const handleSplitComplete = () => {
    setCurrentStep('complete');
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedImageIds([]);
    setFinalizedCount(0);
    onOpenChange(false);
  };

  const stepProgress = currentStep === 'select' ? 33 : currentStep === 'split' ? 66 : 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Dataset Builder</DialogTitle>
          <DialogDescription>
            Build your dataset in two easy steps: finalize images and configure train/val/test split.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={currentStep === 'select' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                1. Select Images
              </span>
              <span className={currentStep === 'split' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                2. Configure Split
              </span>
              <span className={currentStep === 'complete' ? 'text-success font-medium' : 'text-muted-foreground'}>
                3. Complete
              </span>
            </div>
            <Progress value={stepProgress} className="h-2" />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-hidden">
            {currentStep === 'select' && (
              <SelectImagesStep 
              projectId={projectId}
                images={images}
                onComplete={handleImagesFinalized} 
              />
            )}
            
            {currentStep === 'split' && (
              <ConfigureSplitStep
                projectId={projectId}
                finalizedCount={finalizedCount}
                onComplete={handleSplitComplete}
                onBack={() => setCurrentStep('select')}
              />
            )}
            
            {currentStep === 'complete' && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <h3 className="text-2xl font-semibold">Dataset Ready!</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Your dataset has been successfully built and split. Images are now ready for training.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
