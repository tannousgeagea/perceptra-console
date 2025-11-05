import { Button } from "@/components/ui/ui/button";
import { Plus, RefreshCw, Download, ArrowLeft } from "lucide-react";
import { Badge } from '@/components/ui/ui/badge';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/ui/input";
import { useNavigate } from "react-router-dom";
import { JobInfo } from "@/types/image";

interface AnnotateHeaderProps {
  projectId: string;
  job: JobInfo;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export function AnnotateHeader({
  projectId,
  job,
  onRefresh,
  searchQuery,
  setSearchQuery,
}: AnnotateHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/projects/${projectId}/annotate`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {`${job.name ?? "Unnamed Job"} - Created at ${
                    job?.created_at ? new Date(job.created_at).toLocaleString() : "N/A"
                }`}
            </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search image..."
                className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
