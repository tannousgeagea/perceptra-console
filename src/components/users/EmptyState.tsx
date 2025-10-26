
import { Button } from "@/components/ui/ui/button";
import { UserPlus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionIcon = <UserPlus className="mr-2 h-4 w-4" />,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-10 text-center">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionIcon}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}