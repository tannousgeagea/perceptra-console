import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/ui/form";
import { Input } from "@/components/ui/ui/input";
import { Slider } from "@/components/ui/ui/slider";
import { Switch } from "@/components/ui/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/ui/select";
import { Label } from "@/components/ui/ui/label";
import { Model } from "@/types/models";
import { UseFormReturn } from "react-hook-form";

interface ParametersTabProps {
  model: Model;
  form: UseFormReturn<any>;
  isTraining: boolean;
}

const ParametersTab: React.FC<ParametersTabProps> = ({ model, form, isTraining }) => {
  const getModelTypeSpecificParams = () => {
    switch (model.type) {
      case "classification":
        return (
          <>
            <FormItem>
              <FormLabel>Number of Classes</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="10" min="1" />
              </FormControl>
              <FormDescription>The number of categories to classify</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Class Weights</FormLabel>
              <div className="flex gap-2">
                <Switch defaultChecked id="class-weights" disabled={isTraining} />
                <Label htmlFor="class-weights">Apply class weights for imbalanced data</Label>
              </div>
            </FormItem>
          </>
        );

      case "object-detection":
        return (
          <>
            <FormItem>
              <FormLabel>IOU Threshold</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="0.5" min="0" max="1" step="0.01" />
              </FormControl>
              <FormDescription>Intersection over Union threshold for detection</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Confidence Threshold</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="0.25" min="0" max="1" step="0.01" />
              </FormControl>
            </FormItem>
          </>
        );

      case "segmentation":
        return (
          <>
            <FormItem>
              <FormLabel>Mask Format</FormLabel>
              <Select defaultValue="binary">
                <SelectTrigger><SelectValue placeholder="Select mask format" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="multiclass">Multi-class</SelectItem>
                  <SelectItem value="instance">Instance</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Type of segmentation masks</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Loss Function</FormLabel>
              <Select defaultValue="dice">
                <SelectTrigger><SelectValue placeholder="Select loss function" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dice">Dice Loss</SelectItem>
                  <SelectItem value="bce">Binary Cross Entropy</SelectItem>
                  <SelectItem value="focal">Focal Loss</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </>
        );

      case "llm":
      case "vlm":
        return (
          <>
            <FormItem>
              <FormLabel>Base Model</FormLabel>
              <Select defaultValue="bert-base">
                <SelectTrigger><SelectValue placeholder="Select base model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bert-base">BERT Base</SelectItem>
                  <SelectItem value="roberta">RoBERTa</SelectItem>
                  <SelectItem value="t5-base">T5 Base</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Pre-trained model to fine-tune</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Sequence Length</FormLabel>
              <FormControl>
                <Input type="number" defaultValue="512" min="32" />
              </FormControl>
            </FormItem>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="epochs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Epochs: {field.value}</FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value]}
                max={250}
                min={1}
                step={1}
                disabled={isTraining}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            </FormControl>
            <FormDescription>Number of complete passes through the dataset</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="batchSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Batch Size: {field.value}</FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value]}
                max={256}
                min={1}
                step={1}
                disabled={isTraining}
                onValueChange={(vals) => field.onChange(vals[0])}
              />
            </FormControl>
            <FormDescription>Samples processed before updating weights</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="learningRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Learning Rate: {field.value}</FormLabel>
            <FormControl>
              <Slider
                defaultValue={[field.value * 1000]}
                max={10}
                min={0.1}
                step={0.1}
                disabled={isTraining}
                onValueChange={(vals) => field.onChange(vals[0] / 1000)}
              />
            </FormControl>
            <FormDescription>Step size for gradient descent optimization</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {getModelTypeSpecificParams()}
    </>
  );
};

export default ParametersTab;
