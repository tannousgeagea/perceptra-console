import { Job } from "@/types/jobs";


export const renderProgressBar = (job: Job) => {
  if (!job.progress) return null;
  const { total, annotated, reviewed, completed, rejected = 0 } = job.progress;

  const annotatedPct = total ? (annotated / total) * 100 : 0;
  const reviewedPct = total ? (reviewed / total) * 100 : 0;
  const completedPct = total ? (completed / total) * 100 : 0;
  const rejectedPct = total ? (rejected / total) * 100 : 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex min-w-0 items-center gap-1.5">
          Progress
          {rejected > 0 && (
            <span
              className="truncate rounded-full bg-rose-500/10 px-1.5 py-px font-medium text-rose-600"
              title="Sent back by a reviewer, waiting for the assignee's fixes"
            >
              {rejected} to fix
            </span>
          )}
        </span>
        <span className="shrink-0">{completed}/{total} completed</span>
      </div>
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="bg-rose-500" style={{ width: `${rejectedPct}%` }} title={`${rejected} to fix`} />
        <div className="bg-amber-400" style={{ width: `${annotatedPct}%` }} title={`${annotated} annotated`} />
        <div className="bg-purple-400" style={{ width: `${reviewedPct}%` }} title={`${reviewed} reviewed`} />
        <div className="bg-green-500" style={{ width: `${completedPct}%` }} title={`${completed} completed`} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400 dark:text-slate-500">
        <span className="text-amber-600">Annotated: {annotated}</span>
        <span className="text-purple-600">Reviewed: {reviewed}</span>
        <span className="text-green-600">Completed: {completed}</span>
      </div>
    </div>
  );
};
