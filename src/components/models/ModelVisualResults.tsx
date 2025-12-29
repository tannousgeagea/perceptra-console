
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";
import { ModelDetail } from "@/types/models";

// Placeholder components for different visualization types
const ClassificationVisual: React.FC = () => (
  <div className="p-4 border rounded-md bg-muted/30">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/2">
        <img
          src="/placeholder.svg"
          alt="Sample image"
          className="rounded-md object-cover w-full aspect-video bg-muted"
        />
      </div>
      <div className="w-full md:w-1/2">
        <h4 className="font-medium mb-2">Classification Results</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Product A</span>
            <div className="w-2/3">
              <div className="h-4 rounded-full bg-blue-500" style={{ width: "85%" }}></div>
            </div>
            <span className="font-medium">85%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Product B</span>
            <div className="w-2/3">
              <div className="h-4 rounded-full bg-blue-300" style={{ width: "10%" }}></div>
            </div>
            <span className="font-medium">10%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Product C</span>
            <div className="w-2/3">
              <div className="h-4 rounded-full bg-blue-300" style={{ width: "5%" }}></div>
            </div>
            <span className="font-medium">5%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ObjectDetectionVisual: React.FC = () => (
  <div className="p-4 border rounded-md bg-muted/30">
    <div className="relative w-full">
      <img
        src="/placeholder.svg"
        alt="Object detection example"
        className="rounded-md object-cover w-full aspect-video bg-muted"
      />
      {/* Simulated bounding boxes */}
      <div
        className="absolute border-2 border-green-500 rounded"
        style={{ top: "20%", left: "25%", width: "30%", height: "40%" }}
      >
        <div className="bg-green-500 text-white px-2 py-0.5 text-xs absolute top-0 left-0 rounded-bl">
          Product (92%)
        </div>
      </div>
      <div
        className="absolute border-2 border-blue-500 rounded"
        style={{ top: "30%", left: "65%", width: "20%", height: "30%" }}
      >
        <div className="bg-blue-500 text-white px-2 py-0.5 text-xs absolute top-0 left-0 rounded-bl">
          Box (87%)
        </div>
      </div>
    </div>
  </div>
);

const SegmentationVisual: React.FC = () => (
  <div className="p-4 border rounded-md bg-muted/30">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium mb-2">Original Image</h4>
        <img
          src="/placeholder.svg"
          alt="Original image"
          className="rounded-md object-cover w-full aspect-video bg-muted"
        />
      </div>
      <div>
        <h4 className="font-medium mb-2">Segmentation Mask</h4>
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt="Segmentation mask"
            className="rounded-md object-cover w-full aspect-video bg-muted"
          />
          <div
            className="absolute inset-0 bg-red-500 opacity-20 mask-circle"
            style={{ clipPath: "polygon(30% 20%, 60% 20%, 70% 40%, 60% 70%, 30% 70%, 20% 40%)" }}
          ></div>
          <div
            className="absolute inset-0 bg-blue-500 opacity-20 mask-circle"
            style={{ clipPath: "polygon(65% 30%, 85% 30%, 90% 45%, 80% 65%, 65% 65%, 60% 45%)" }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const TextGenerationVisual: React.FC = () => (
  <div className="p-4 border rounded-md bg-muted/30">
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Input Prompt</h4>
        <div className="bg-muted p-3 rounded-md">
          <p className="text-muted-foreground">Describe this product in a professional tone.</p>
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-2">Generated Output</h4>
        <div className="bg-accent/10 p-3 rounded-md">
          <p>This premium widget features a sleek, ergonomic design crafted from high-grade aluminum. Its precision-engineered components ensure reliable performance for both home and professional environments. The intuitive interface allows for seamless operation while maintaining energy efficiency. Compact yet robust, this product represents the perfect balance of form and function for the discerning consumer.</p>
        </div>
      </div>
    </div>
  </div>
);

const VisualLanguageModelVisual: React.FC = () => (
  <div className="p-4 border rounded-md bg-muted/30">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium mb-2">Input Image</h4>
        <img
          src="/placeholder.svg"
          alt="Input image"
          className="rounded-md object-cover w-full aspect-video bg-muted"
        />
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Input Question</h4>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-muted-foreground">What defects can you identify in this product?</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Generated Answer</h4>
          <div className="bg-accent/10 p-3 rounded-md">
            <p>I can identify several defects in this product:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>There's a scratch along the top right edge</li>
              <li>The surface finish shows uneven coloration near the center</li>
              <li>The left corner appears to have slight deformation</li>
            </ol>
            <p className="mt-2">These defects suggest issues with the manufacturing process, potentially in the finishing and quality control stages.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ModelVisualResults: React.FC<{ model: ModelDetail }> = ({ model }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(
    model.production_version?.id || 
    (model.versions.length > 0 ? model.versions[0].id : "")
  );
  
  const [sampleIndex, setSampleIndex] = useState<string>("1");

  const renderVisualization = () => {
    switch (model.task) {
      case "classification":
        return <ClassificationVisual />;
      case "object-detection":
        return <ObjectDetectionVisual />;
      case "segmentation":
        return <SegmentationVisual />;
      case "llm":
        return <TextGenerationVisual />;
      case "vlm":
        return <VisualLanguageModelVisual />;
      default:
        return <div className="p-4 text-center">No visualization available for this model type.</div>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Results Visualization</CardTitle>
          <CardDescription>
            See how your model performs on sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Version
              </label>
              <Select 
                value={selectedVersion} 
                onValueChange={setSelectedVersion}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {model.versions
                    .filter(v => v.status === "trained" || v.status === "deployed")
                    .sort((a, b) => b.version_number - a.version_number)
                    .map(version => (
                      <SelectItem
                        key={version.id}
                        value={version.id}
                      >
                        v{version.version_number}
                        {version.tags.includes("production") ? " (Production)" : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Sample
              </label>
              <Select value={sampleIndex} onValueChange={setSampleIndex}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Sample" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sample 1</SelectItem>
                  <SelectItem value="2">Sample 2</SelectItem>
                  <SelectItem value="3">Sample 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {renderVisualization()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelVisualResults;