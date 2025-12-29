import React, { useState, useEffect } from "react";
import { X, Tag, Save, Loader2 } from "lucide-react";

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
import { Badge } from "@/components/ui/ui/badge";
import { ModelListItem, ModelTask } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";

interface EditModelDialogProps {
  model: ModelListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedModel: ModelListItem) => void;
}

const modelTypes: { value: ModelTask; label: string }[] = [
  { value: "classification", label: "Classification" },
  { value: "object-detection", label: "Object Detection" },
  { value: "segmentation", label: "Segmentation" },
  { value: "llm", label: "Language Model" },
  { value: "vlm", label: "Vision-Language Model" },
];

const EditModelDialog: React.FC<EditModelDialogProps> = ({
  model,
  open,
  onOpenChange,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ModelTask>("classification");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (model) {
      setName(model.name);
      setDescription(model.description);
      setType(model.task);
      setTags([...model.tags]);
    }
  }, [model]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!model || !name.trim()) return;

    setIsSaving(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const updatedModel: ModelListItem = {
      ...model,
      name: name.trim(),
      description: description.trim(),
      task: type,
      tags,
      updated_at: new Date().toISOString(),
    };

    onSave(updatedModel);
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <CustomDialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[500px]">
        <CustomDialogHeader>
          <CustomDialogTitle className="text-xl font-semibold">Edit Model</CustomDialogTitle>
          <CustomDialogDescription>
            Update your model's details and tags. Changes will be saved immediately.
          </CustomDialogDescription>
        </CustomDialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Model Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter model name"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this model does..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type" className="text-sm font-medium">
              Model Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as ModelTask)}>
              <SelectTrigger id="edit-type" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags" className="text-sm font-medium">
              Tags
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter..."
                className="h-10 pl-10"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 text-sm group cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter to add a tag. Click a tag to remove it.
            </p>
          </div>
        </div>

        <CustomDialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  );
};

export default EditModelDialog;