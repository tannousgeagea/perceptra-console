import { Button } from '@/components/ui/ui/button';
import { Project } from "@/types/project";
import { X, FolderPlus, Download, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';

interface DataLakeSelectionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddToProject: (projectId: string) => void;
  projects:Project[];
  isLoadingProjects: boolean;
}

export function DataLakeSelectionHeader({
  selectedCount,
  onClearSelection,
  onAddToProject,
  projects,
  isLoadingProjects,
}: DataLakeSelectionHeaderProps) {
  if (selectedCount === 0) return null;


  console.log(projects)
  return (
    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{selectedCount}</span>
          <span>{selectedCount === 1 ? 'image' : 'images'} selected</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select onValueChange={onAddToProject} disabled={isLoadingProjects}>
          <SelectTrigger className="w-[200px] bg-white text-foreground">
            <FolderPlus className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Add to project..." />
          </SelectTrigger>
          <SelectContent>
            {isLoadingProjects ? (
              <SelectItem value="loading" disabled>
                Loading projects...
              </SelectItem>
            ) : projects.length === 0 ? (
              <SelectItem value="none" disabled>
                No projects available
              </SelectItem>
            ) : (
              projects.map((project) => (
                <SelectItem key={project.id} value={project.project_id}>
                  {project.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => console.log('Download selected')}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => console.log('Delete selected')}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
