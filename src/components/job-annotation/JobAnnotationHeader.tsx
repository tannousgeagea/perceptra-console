import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { ArrowLeft, RefreshCw, Search, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobAnnotationHeaderProps {
  jobName: string;
  createdAt: string;
  onRefresh: () => void;
  searchText: string;
  onSearchChange: (text: string) => void; 
  onBack: () => void;
  onBuildDataset: () => void;
}

export function JobAnnotationHeader({
  jobName,
  createdAt,
  onRefresh,
  searchText,
  onSearchChange,
  onBack,
  onBuildDataset,
}: JobAnnotationHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{jobName}</h1>
          <p className="text-sm text-muted-foreground">Created at {createdAt}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
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

        <Button onClick={onBuildDataset} className="gap-2">
          <List className="h-4 w-4" />
          Build Dataset
        </Button>
      </div>
    </div>
  );
}
