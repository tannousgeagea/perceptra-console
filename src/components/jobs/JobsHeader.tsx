import { Button } from "@/components/ui/ui/button";
import { RefreshCw } from "lucide-react";
import { Badge } from '@/components/ui/ui/badge';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";

/** Jobs per status column (the server keeps statuses in step with the images). */
export interface JobStatusCounts {
  unassigned: number;
  assigned: number;
  inReview: number;
  completed: number;
}

interface JobsHeaderProps {
  totalJobs: number;
  counts: JobStatusCounts;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export function JobsHeader({
  totalJobs,
  counts,
  onRefresh,
  searchQuery,
  setSearchQuery,
}: JobsHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="p-6">
        <PageHeader
          className="mb-6"
          title="Annotate"
          description="Manage and assign jobs before annotation"
          actions={
          <>
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search jobs, users..."
                className="pl-9 bg-slate-100 border-slate-200 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </>
          }
        />

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <Badge variant="secondary">{totalJobs}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Unassigned:</span>
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">{counts.unassigned}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">In progress:</span>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{counts.assigned}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">In review:</span>
            <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20">{counts.inReview}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Completed:</span>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{counts.completed}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
