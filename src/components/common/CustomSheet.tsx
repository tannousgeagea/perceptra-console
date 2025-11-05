import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function CustomSheet({ 
  open, 
  onOpenChange,
  className, 
  children 
}: CustomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className={cn(
          className,
          "fixed right-0 top-0 h-full w-full sm:max-w-4xl bg-background border-l shadow-lg animate-in slide-in-from-right duration-300 overflow-y-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
}

export function CustomSheetContent({ 
  children, 
  className = '', 
  showClose = true,
  onClose 
}: SheetContentProps) {
  return (
    <div className={cn("p-6",
       className)}>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />className="w-full sm:max-w-4xl overflow-y-auto"
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSheetHeader({ children, className = '' }: SheetHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 text-left mb-6 ${className}`}>
      {children}
    </div>
  );
}

interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSheetTitle({ children, className = '' }: SheetTitleProps) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSheetDescription({ children, className = '' }: SheetDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}