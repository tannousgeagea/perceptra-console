import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Switch } from "@/components/ui/ui/switch";
import { BillingRateCard, BillingRateCardCreate } from "@/types/billing";
import { toast } from "sonner";
import { Project } from "@/types/project";

interface CreateRateCardDialogProps {
  open: boolean;
  projects: Project[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (card: BillingRateCard) => void;
}

export function CreateRateCardDialog({ open, onOpenChange, projects, onSuccess }: CreateRateCardDialogProps) {
  const [formData, setFormData] = useState<BillingRateCardCreate>({
    name: "",
    currency: "USD",
    rate_new_annotation: 0.25,
    rate_untouched_prediction: 0.05,
    rate_minor_edit: 0.10,
    rate_major_edit: 0.20,
    rate_class_change: 0.15,
    rate_deletion: 0.08,
    rate_missed_object: 0.30,
    rate_image_review: 0.12,
    rate_annotation_review: 0.15,
    quality_bonus_threshold: 95,
    quality_bonus_multiplier: 1.2
  });

  const [projectScope, setProjectScope] = useState<"org" | "project">("org");
  const [hasQualityBonus, setHasQualityBonus] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCard: BillingRateCard = {
      rate_card_id: `rc-${Date.now()}`,
      organization_id: 1,
      organization_name: "DataAnnotation Corp",
      project_id: projectScope === "project" ? formData.project_id : undefined,
      project_name: projectScope === "project" && formData.project_id 
        ? projects.find(p => p.project_id === formData.project_id)?.name 
        : undefined,
      name: formData.name,
      currency: formData.currency,
      is_active: true,
      rate_new_annotation: formData.rate_new_annotation,
      rate_untouched_prediction: formData.rate_untouched_prediction,
      rate_minor_edit: formData.rate_minor_edit,
      rate_major_edit: formData.rate_major_edit,
      rate_class_change: formData.rate_class_change,
      rate_deletion: formData.rate_deletion,
      rate_missed_object: formData.rate_missed_object,
      rate_image_review: formData.rate_image_review,
      rate_annotation_review: formData.rate_annotation_review,
      quality_bonus_threshold: hasQualityBonus ? formData.quality_bonus_threshold : undefined,
      quality_bonus_multiplier: hasQualityBonus ? formData.quality_bonus_multiplier : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_username: "admin"
    };

    onSuccess(newCard);
    toast.success("Rate card created successfully");
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      currency: "USD",
      rate_new_annotation: 0.25,
      rate_untouched_prediction: 0.05,
      rate_minor_edit: 0.10,
      rate_major_edit: 0.20,
      rate_class_change: 0.15,
      rate_deletion: 0.08,
      rate_missed_object: 0.30,
      rate_image_review: 0.12,
      rate_annotation_review: 0.15,
      quality_bonus_threshold: 95,
      quality_bonus_multiplier: 1.2
    });
    setProjectScope("org");
    setHasQualityBonus(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rate Card</DialogTitle>
          <DialogDescription>
            Define billing rates for annotation activities
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rate Card Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Traffic Rates"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scope</Label>
                <Select value={projectScope} onValueChange={(v) => setProjectScope(v as "org" | "project")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org">Organization-Wide</SelectItem>
                    <SelectItem value="project">Project-Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {projectScope === "project" && (
                <div>
                  <Label>Project</Label>
                  <Select 
                    value={formData.project_id} 
                    onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.project_id} value={project.project_id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Annotation Rates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate_new_annotation">New Annotation</Label>
                  <Input
                    id="rate_new_annotation"
                    type="number"
                    step="0.01"
                    value={formData.rate_new_annotation}
                    onChange={(e) => setFormData({ ...formData, rate_new_annotation: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_untouched_prediction">Untouched Prediction</Label>
                  <Input
                    id="rate_untouched_prediction"
                    type="number"
                    step="0.01"
                    value={formData.rate_untouched_prediction}
                    onChange={(e) => setFormData({ ...formData, rate_untouched_prediction: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_missed_object">Missed Object</Label>
                  <Input
                    id="rate_missed_object"
                    type="number"
                    step="0.01"
                    value={formData.rate_missed_object}
                    onChange={(e) => setFormData({ ...formData, rate_missed_object: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Edit Rates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate_minor_edit">Minor Edit</Label>
                  <Input
                    id="rate_minor_edit"
                    type="number"
                    step="0.01"
                    value={formData.rate_minor_edit}
                    onChange={(e) => setFormData({ ...formData, rate_minor_edit: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_major_edit">Major Edit</Label>
                  <Input
                    id="rate_major_edit"
                    type="number"
                    step="0.01"
                    value={formData.rate_major_edit}
                    onChange={(e) => setFormData({ ...formData, rate_major_edit: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_class_change">Class Change</Label>
                  <Input
                    id="rate_class_change"
                    type="number"
                    step="0.01"
                    value={formData.rate_class_change}
                    onChange={(e) => setFormData({ ...formData, rate_class_change: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_deletion">Deletion</Label>
                  <Input
                    id="rate_deletion"
                    type="number"
                    step="0.01"
                    value={formData.rate_deletion}
                    onChange={(e) => setFormData({ ...formData, rate_deletion: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Review Rates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rate_image_review">Image Review</Label>
                  <Input
                    id="rate_image_review"
                    type="number"
                    step="0.01"
                    value={formData.rate_image_review}
                    onChange={(e) => setFormData({ ...formData, rate_image_review: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rate_annotation_review">Annotation Review</Label>
                  <Input
                    id="rate_annotation_review"
                    type="number"
                    step="0.01"
                    value={formData.rate_annotation_review}
                    onChange={(e) => setFormData({ ...formData, rate_annotation_review: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Quality Bonus</h3>
                <Switch checked={hasQualityBonus} onCheckedChange={setHasQualityBonus} />
              </div>
              {hasQualityBonus && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality_bonus_threshold">Threshold (%)</Label>
                    <Input
                      id="quality_bonus_threshold"
                      type="number"
                      value={formData.quality_bonus_threshold}
                      onChange={(e) => setFormData({ ...formData, quality_bonus_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality_bonus_multiplier">Multiplier</Label>
                    <Input
                      id="quality_bonus_multiplier"
                      type="number"
                      step="0.1"
                      value={formData.quality_bonus_multiplier}
                      onChange={(e) => setFormData({ ...formData, quality_bonus_multiplier: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Rate Card</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
