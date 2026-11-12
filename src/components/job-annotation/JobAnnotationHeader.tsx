import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { ChevronRight, RefreshCw, Search, List, Sparkle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

interface JobAnnotationHeaderProps {
  jobName: string;
  createdAt: string;
  onRefresh: () => void;
  searchText: string;
  onSearchChange: (text: string) => void; 
  onBack: () => void;
  onBuildDataset: () => void;
  /** Replaces "Created at …" (e.g. for the "All jobs" view). */
  subtitle?: string;
  /** AI Label and Build Dataset act on one job; off for "All jobs". */
  jobActions?: boolean;
}

export function JobAnnotationHeader({
  jobName,
  createdAt,
  onRefresh,
  searchText,
  onSearchChange,
  onBack,
  onBuildDataset,
  subtitle,
  jobActions = true,
}: JobAnnotationHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-2">
      {/* Breadcrumb: one level up is the job list ("Back to Projects" leaves the project). */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
        <button type="button" onClick={onBack} className="rounded hover:text-foreground hover:underline">
          Annotate
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{jobName}</span>
      </nav>
    <PageHeader
      title={jobName}
      description={subtitle ?? `Created at ${createdAt}`}
      actions={
      <>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <div className="relative flex-1 sm:flex-initial sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search image..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {jobActions && (
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(`${location.pathname}/auto-annotate`)}>
              <Sparkle className="w-4 h-4" />
              AI Label
            </Button>

            <Button onClick={onBuildDataset} className="gap-2">
              <List className="h-4 w-4" />
              Build Dataset
            </Button>
          </>
        )}
      </>
      }
    />
    </div>
  );
}
