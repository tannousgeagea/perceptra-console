import { AlertCircle } from "lucide-react";

export const ValidationErrors: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/40">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

        <div className="min-w-0">
          <h4 className="mb-2 font-medium text-red-800 dark:text-red-300">
            Please fix the following errors:
          </h4>

          <ul className="space-y-1 text-sm text-red-700 dark:text-red-200">
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