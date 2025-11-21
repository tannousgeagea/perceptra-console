import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Switch } from "@/components/ui/ui/switch";
import { BillingRateCard, UpdateRateCardPayload } from "@/types/billing";
import { toast } from "sonner";

interface EditRateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rateCard: BillingRateCard;
  onSuccess: (card: BillingRateCard) => void;
}

export function EditRateCardDialog({ open, onOpenChange, rateCard, onSuccess }: EditRateCardDialogProps) {
  const [formData, setFormData] = useState(rateCard);
  const [hasQualityBonus, setHasQualityBonus] = useState(!!rateCard.quality_bonus_threshold);
  const [changedFields, setChangedFields] = useState<UpdateRateCardPayload>({});

  const handleFieldChange = (field: keyof UpdateRateCardPayload, value: any) => {
    setChangedFields(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setFormData(rateCard);
    setHasQualityBonus(!!rateCard.quality_bonus_threshold);
  }, [rateCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCard: BillingRateCard = {
      ...formData,
      quality_bonus_threshold: hasQualityBonus ? formData.quality_bonus_threshold : undefined,
      quality_bonus_multiplier: hasQualityBonus ? formData.quality_bonus_multiplier : undefined,
      updated_at: new Date().toISOString()
    };

    onSuccess(updatedCard);
    toast.success("Rate card updated successfully");
  };


  console.log(open)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rate Card</DialogTitle>
          <DialogDescription>
            Update billing rates for annotation activities
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
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active Status</Label>
              <Switch 
                id="is_active"
                checked={formData.is_active} 
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} 
              />
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
                      value={formData.quality_bonus_threshold || 95}
                      onChange={(e) => setFormData({ ...formData, quality_bonus_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality_bonus_multiplier">Multiplier</Label>
                    <Input
                      id="quality_bonus_multiplier"
                      type="number"
                      step="0.1"
                      value={formData.quality_bonus_multiplier || 1.2}
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
            <Button type="submit">Update Rate Card</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
