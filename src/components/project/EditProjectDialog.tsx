import { useState, useEffect } from "react";
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
  onSubmit: (id: string, data: ProjectUpdate) => void;
}

export const EditProjectDialog = ({
  open,
  onOpenChange,
  project,
  onSubmit,
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
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (project) {
      onSubmit(project.project_id, formData);
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
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CustomDialogFooter>
        </form>
      </CustomDialogContent>
    </CustomDialog>
  );
};
