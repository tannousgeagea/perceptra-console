import { Job } from "@/types/jobs";


export const renderProgressBar = (job: Job) => {
  if (!job.progress) return null;
  const { total, annotated, reviewed, completed } = job.progress;

  const annotatedPct = total ? (annotated / total) * 100 : 0;
  const reviewedPct = total ? (reviewed / total) * 100 : 0;
  const completedPct = total ? (completed / total) * 100 : 0;

  return (
    <div className="mt-3">
      <div className="flex justify-between mb-1 text-xs text-slate-500">
        <span>Progress</span>
        <span>{completed}/{total} completed</span>
      </div>
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100">
        <div className="bg-amber-400" style={{ width: `${annotatedPct}%` }} title={`${annotated} annotated`} />
        <div className="bg-purple-400" style={{ width: `${reviewedPct}%` }} title={`${reviewed} reviewed`} />
        <div className="bg-green-500" style={{ width: `${completedPct}%` }} title={`${completed} completed`} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span className="text-amber-600">Annotated: {annotated}</span>
        <span className="text-purple-600">Reviewed: {reviewed}</span>
        <span className="text-green-600">Completed: {completed}</span>
      </div>
    </div>
  );
};
