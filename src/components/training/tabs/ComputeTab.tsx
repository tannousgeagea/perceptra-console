import React from "react";
import { Switch } from "@/components/ui/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/ui/form";
import { Label } from "@/components/ui/ui/label";

interface ComputeTabProps {
  isTraining: boolean;
}

const ComputeTab: React.FC<ComputeTabProps> = ({ isTraining }) => {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Compute Instance</FormLabel>
        <Select defaultValue="gpu-standard" disabled={isTraining}>
          <SelectTrigger>
            <SelectValue placeholder="Select instance type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpu-small">CPU Small (2 vCPUs, 8GB RAM)</SelectItem>
            <SelectItem value="cpu-medium">CPU Medium (4 vCPUs, 16GB RAM)</SelectItem>
            <SelectItem value="gpu-standard">GPU Standard (1 GPU, 16GB VRAM)</SelectItem>
            <SelectItem value="gpu-large">GPU Large (4 GPUs, 64GB VRAM)</SelectItem>
          </SelectContent>
        </Select>
        <FormDescription>
          Compute resources to allocate for training
        </FormDescription>
      </FormItem>

      <FormItem>
        <FormLabel>Distributed Training</FormLabel>
        <div className="flex gap-2">
          <Switch id="distributed" disabled={isTraining} />
          <Label htmlFor="distributed">Enable distributed training across multiple nodes</Label>
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Mixed Precision</FormLabel>
        <div className="flex gap-2">
          <Switch id="mixed-precision" defaultChecked disabled={isTraining} />
          <Label htmlFor="mixed-precision">Use mixed precision (FP16) to speed up training</Label>
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Early Stopping</FormLabel>
        <div className="flex gap-2">
          <Switch id="early-stopping" defaultChecked disabled={isTraining} />
          <Label htmlFor="early-stopping">Stop training if validation metrics don't improve</Label>
        </div>
        <FormDescription>
          Patience: 5 epochs
        </FormDescription>
      </FormItem>
    </div>
  );
};

export default ComputeTab;
