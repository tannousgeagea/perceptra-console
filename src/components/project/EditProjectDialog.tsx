import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { 
  CustomDialog, 
  CustomDialogContent, 
  CustomDialogHeader, 
  CustomDialogTitle, 
  CustomDialogDescription, 
  CustomDialogFooter 
} from "@/components/common/CustomDialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Textarea } from "@/components/ui/ui/textarea";
import { Switch } from "@/components/ui/ui/switch";
import type { Project, ProjectUpdate } from "@/types/project";
import { toast } from "sonner";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  /** Receives only the fields that changed. */
  onSubmit: (id: string, data: ProjectUpdate) => void;
  isSaving?: boolean;
}

export const EditProjectDialog = ({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSaving = false,
}: EditProjectDialogProps) => {
  const [formData, setFormData] = useState<ProjectUpdate>({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        is_active: project.is_active,
        thumbnail_url: project.thumbnail_url || "",
      });
    }
  }, [project, open]);

  const changes = useMemo<ProjectUpdate>(() => {
    if (!project) return {};
    const diff: ProjectUpdate = {};
    const name = formData.name?.trim() ?? "";
    if (name !== project.name) diff.name = name;
    if ((formData.description ?? "") !== (project.description ?? "")) diff.description = formData.description;
    if ((formData.thumbnail_url ?? "") !== (project.thumbnail_url ?? "")) diff.thumbnail_url = formData.thumbnail_url;
    if (formData.is_active !== project.is_active) diff.is_active = formData.is_active;
    return diff;
  }, [formData, project]);
  const hasChanges = Object.keys(changes).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (project && hasChanges) {
      onSubmit(project.project_id, changes);
    }
  };

  if (!project) return null;

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[525px]">
        <CustomDialogHeader>
          <CustomDialogTitle>Edit Project</CustomDialogTitle>
          <CustomDialogDescription>
            Update project details. Changes will be saved immediately.
          </CustomDialogDescription>
        </CustomDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter project name"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
            <Input
              id="edit-thumbnail"
              value={formData.thumbnail_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active">Active Status</Label>
              <div className="text-sm text-muted-foreground">
                Control whether this project is active
              </div>
            </div>
            <Switch
              id="edit-active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <CustomDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!hasChanges || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </CustomDialogFooter>
        </form>
      </CustomDialogContent>
    </CustomDialog>
  );
};
