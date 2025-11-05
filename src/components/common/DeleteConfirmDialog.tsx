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
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // Only render trigger if not using controlled state
  const shouldRenderTrigger = controlledOpen === undefined;

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
        <CustomDialogContent showClose onClose={handleCancel}>
          <CustomDialogHeader>
            <CustomDialogTitle>{title}</CustomDialogTitle>
            <CustomDialogDescription>
              {description}
            </CustomDialogDescription>
          </CustomDialogHeader>

          {requireTextConfirmation && (
            <div className="mt-3 mb-4">
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
              onClick={handleConfirm}
              disabled={!isConfirmed || isLoading}
              className={
                isConfirmed && !isLoading
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </CustomDialogFooter>
        </CustomDialogContent>
      </CustomDialog>
    </>
  );
}