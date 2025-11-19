import { Card } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Users, ImageIcon, Tag } from "lucide-react";
import type { Project } from "@/types/project";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project);
  };
 
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative h-48 bg-muted">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant={project.is_active ? "default" : "secondary"}>
            {project.is_active ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{project.project_type_name}</Badge>
          <Badge variant="outline">{project.visibility_name}</Badge>
          <Badge variant="outline">{project.user_role}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <ImageIcon className="h-3 w-3" />
            </div>
            <div className="text-sm font-semibold">{project.statistics.total_images}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Tag className="h-3 w-3" />
            </div>
            <div className="text-sm font-semibold">{project.statistics.total_annotations}</div>
            <div className="text-xs text-muted-foreground">Annotations</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
            </div>
            <div className="text-sm font-semibold">{project.statistics.annotation_groups}</div>
            <div className="text-xs text-muted-foreground">Groups</div>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          <div>Created: {format(new Date(project.created_at), "MMM d, yyyy")}</div>
          <div>Updated: {format(new Date(project.last_edited), "MMM d, yyyy")}</div>
          {project.created_by && (
            <div>
              By: {project.created_by.first_name} {project.created_by.last_name}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
