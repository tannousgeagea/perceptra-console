import { AlertCircle } from "lucide-react";

export const ValidationErrors: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-[var(--mtx-error-border)] bg-[var(--mtx-error-bg)] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

        <div className="min-w-0">
          <h4 className="mb-2 font-medium text-[var(--mtx-error-text)]">
            Please fix the following errors:
          </h4>

          <ul className="space-y-1 text-sm text-[var(--mtx-error-text)]">
            {errors.map((error, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-[2px]">•</span>
                <span className="break-words">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};