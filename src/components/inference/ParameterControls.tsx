
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Slider } from '@/components/ui/ui/slider';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface Parameters {
  confidence: number;
  iou: number;
  maxDetections: number;
}

interface ParameterControlsProps {
  parameters: Parameters;
  setParameters: (params: Parameters) => void;
  selectedModel: any;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  setParameters,
  selectedModel
}) => {
  const updateParameter = (key: keyof Parameters, value: number) => {
    setParameters({
      ...parameters,
      [key]: value
    });
  };

  const ParameterSlider = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step, 
    tooltip 
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    tooltip: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Label className="text-sm font-medium">{label}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-48">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 h-8 text-xs"
          min={min}
          max={max}
          step={step}
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Inference Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedModel ? (
          <>
            <ParameterSlider
              label="Confidence Threshold"
              value={parameters.confidence}
              onChange={(value) => updateParameter('confidence', value)}
              min={0}
              max={1}
              step={0.05}
              tooltip="Minimum confidence score for detections. Higher values reduce false positives but may miss detections."
            />

            <ParameterSlider
              label="IoU Threshold"
              value={parameters.iou}
              onChange={(value) => updateParameter('iou', value)}
              min={0}
              max={1}
              step={0.05}
              tooltip="Intersection over Union threshold for non-maximum suppression. Controls overlap between detections."
            />

            <ParameterSlider
              label="Max Detections"
              value={parameters.maxDetections}
              onChange={(value) => updateParameter('maxDetections', value)}
              min={1}
              max={200}
              step={1}
              tooltip="Maximum number of detections to return. Limits output for performance."
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 space-y-1">
                <p>Model: {selectedModel.name}</p>
                <p>Category: {selectedModel.category}</p>
                <p>Version: {selectedModel.version}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Select a model to configure parameters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};