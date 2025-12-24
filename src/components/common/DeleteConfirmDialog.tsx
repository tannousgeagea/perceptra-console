import { useState, useEffect } from 'react';
import { 
  CustomDialog, 
  CustomDialogContent, 
  CustomDialogHeader, 
  CustomDialogTitle, 
  CustomDialogDescription, 
  CustomDialogFooter 
} from '@/components/common/CustomDialog';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Loader2, Trash2 } from 'lucide-react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  // Required props
  title: string;
  description: string | React.ReactNode;
  confirmText: string;
  onConfirm: () => void;
  
  // Controlled state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Optional props
  isLoading?: boolean;
  disabled?: boolean;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'destructive' | 'outline' | 'ghost';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  triggerClassName?: string;
  requireTextConfirmation?: boolean;
  children?: React.ReactNode; // Custom trigger
}

export function DeleteConfirmDialog({
  title,
  description,
  confirmText,
  onConfirm,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoading = false,
  disabled = false,
  triggerLabel = 'Delete',
  triggerVariant = 'ghost',
  triggerSize = 'icon',
  triggerClassName = 'text-red-500 hover:text-red-600 hover:bg-red-50/50',
  requireTextConfirmation = true,
  children,
}: DeleteConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isConfirmed = requireTextConfirmation 
    ? inputText.trim() === confirmText 
    : true;

  // Reset input text when dialog closes
  useEffect(() => {
    if (!open) {
      setInputText('');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // Only render trigger if not using controlled state
  const shouldRenderTrigger = controlledOpen === undefined;


  console.log(isLoading)
  return (
    <>
      {/* Trigger (only if uncontrolled) */}
      {shouldRenderTrigger && (
        <>
          {children ? (
            <div onClick={() => !disabled && !isLoading && setOpen(true)}>
              {children}
            </div>
          ) : (
            <Button
              variant={triggerVariant}
              size={triggerSize}
              className={triggerClassName}
              disabled={disabled || isLoading}
              onClick={() => setOpen(true)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : triggerSize === 'icon' ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                triggerLabel
              )}
            </Button>
          )}
        </>
      )}

      {/* Dialog */}
      <CustomDialog open={open} onOpenChange={setOpen}>
        <CustomDialogContent showClose onClose={handleCancel} className='space-y-4'>
          <CustomDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>

              <div>
                <CustomDialogTitle className='text-xl'>{title}</CustomDialogTitle>
                <CustomDialogDescription className="mt-1">
                  This action cannot be undone.
                </CustomDialogDescription>
              </div>
            </div>

            <CustomDialogDescription>
              {description}
            </CustomDialogDescription>
          </CustomDialogHeader>

          {requireTextConfirmation && (
            <div className="mt-3 mb-4">
              <p className="text-sm font-medium py-2">
                Type <span className="font-mono text-destructive">{confirmText}</span> to confirm:
              </p>
              <Input
                placeholder={`Type "${confirmText}" to confirm`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isConfirmed && !isLoading) {
                    handleConfirm();
                  }
                }}
              />
            </div>
          )}

          <CustomDialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant='destructive'
              onClick={handleConfirm}
              disabled={!isConfirmed || isLoading}
              className={
                isConfirmed && !isLoading
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'cursor-not-allowed'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {title}
                </>

              )}
            </Button>
          </CustomDialogFooter>
        </CustomDialogContent>
      </CustomDialog>
    </>
  );
}