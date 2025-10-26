import { useState } from "react";
import { useTriggerValidation } from "@/hooks/useTriggerValidation";
import { Button } from "@/components/ui/ui/button";
import { Loader2 } from "lucide-react";
import { TaskProgressTracker } from "../progress/TaskProgressTracker";

interface TriggerValidationButtonProps {
  modelVersionId: number;
  onValidationComplete?: () => void;
}

const TriggerValidationButton = ({ modelVersionId, onValidationComplete }: TriggerValidationButtonProps) => {
  const [taskId] = useState(() => `validate-${modelVersionId}-${Date.now()}`);

  const {
    mutate,
    isPending,
    isError,
    error,
    isSuccess,
  } = useTriggerValidation(taskId);

  const handleClick = () => {
    mutate(modelVersionId, {
      onSuccess: () => {
        onValidationComplete?.()
      },
    });
  };

  return (
    <div className="space-y-2 p-6 w-full">
      <Button onClick={handleClick} disabled={isPending || !modelVersionId}>
        {isPending ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Running Validation...
          </>
        ) : (
          "Trigger Validation"
        )}
      </Button>

      {isError && (
        <p className="text-sm text-red-500">
          {(error as Error).message}
        </p>
      )}

      {isPending && taskId && (
        <div className="flex w-full items-center justify-center p-6">
          <TaskProgressTracker
              taskId={taskId || ''}
              title="Generate Validation"
              variant="bar"
              size="md"
              pollingInterval={1000}
          />
        </div>
      )}

      {isSuccess && (
        <p className="text-sm text-green-600">
          ✅ Validation completed successfully.
        </p>
      )}
    </div>
  );
};

export default TriggerValidationButton;
