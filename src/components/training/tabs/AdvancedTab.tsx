import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/ui/form";
import { Textarea } from "@/components/ui/ui/textarea";
import { toast } from "sonner";

interface AdvancedTabProps {
  isTraining: boolean;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({ isTraining }) => {
  const [configCode, setConfigCode] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(`Config file "${file.name}" selected.`, {
      description: "File will be used for model training configuration.",
    });

    // Optional: read and populate textarea
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setConfigCode(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleConfigCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigCode(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FormLabel>Configuration File</FormLabel>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isTraining}
            asChild
          >
            <label htmlFor="config-file" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Config
              <input
                id="config-file"
                type="file"
                className="hidden"
                accept=".yaml,.json"
                onChange={handleFileUpload}
                disabled={isTraining}
              />
            </label>
          </Button>
        </div>
        <FormDescription>
          Upload a YAML or JSON configuration file
        </FormDescription>
      </div>

      <div className="space-y-2">
        <FormLabel>Raw Configuration</FormLabel>
        <Textarea
          placeholder={`# YAML configuration
epochs: 10
batch_size: 32
learning_rate: 0.001
model_config:
  architecture: resnet50
  pretrained: true
  freeze_layers: 5`}
          className="font-mono text-sm"
          rows={10}
          disabled={isTraining}
          onChange={handleConfigCodeChange}
          value={configCode}
        />
        <FormDescription>
          Directly edit or paste your training configuration
        </FormDescription>
      </div>
    </div>
  );
};

export default AdvancedTab;
