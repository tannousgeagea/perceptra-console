import { Button } from "@/components/ui/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  loadingMessage?: string;
}

const QueryState: React.FC<QueryStateProps> = ({
  isLoading,
  isError,
  errorMessage = "Something went wrong while loading data.",
  onRetry,
  loadingMessage = "Loading...",
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground animate-fade-in w-full">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-primary" />
        <p className="text-sm font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-destructive animate-fade-in w-full">
        <AlertCircle className="w-6 h-6 mb-3" />
        <p className="text-sm font-medium text-center max-w-sm">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default QueryState;
