import { useState } from 'react';
import { AIModel, LabelConfig } from '@/types/auto-annotate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/ui/radio-group';
import { X, Cpu, Tag, ChevronLeft, Sparkles } from 'lucide-react';

interface Props {
  models: AIModel[];
  selectedModel: AIModel | null;
  onSelectModel: (m: AIModel) => void;
  labels: string[];
  labelPresets: LabelConfig[];
  onAddLabel: (l: string) => void;
  onRemoveLabel: (l: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ConfigureStep({
  models,
  selectedModel,
  onSelectModel,
  labels,
  labelPresets,
  onAddLabel,
  onRemoveLabel,
  onBack,
  onNext,
}: Props) {
  const [labelInput, setLabelInput] = useState('');

  const handleAddLabels = () => {
    labelInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach(onAddLabel);
    setLabelInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabels();
    }
  };

  return (
    <div className="space-y-6">
      {/* Model selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4" /> Select Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedModel?.id || ''}
            onValueChange={(val) => {
              const m = models.find((m) => m.id === val);
              if (m) onSelectModel(m);
            }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {models.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel?.id === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={model.id} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{model.name}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {model.version}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Accuracy:</span>
                      <span className="text-xs font-medium">{model.accuracy}%</span>
                      <div className="flex gap-1 ml-auto">
                        {model.supportedTypes.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Label configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" /> Target Labels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter labels (comma-separated)..."
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button variant="secondary" onClick={handleAddLabels} disabled={!labelInput.trim()}>
              Add
            </Button>
          </div>

          {/* Selected labels */}
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <Badge key={label} variant="default" className="gap-1 pr-1">
                  {label}
                  <button
                    onClick={() => onRemoveLabel(label)}
                    className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Presets */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Sparkles className="h-3 w-3" /> Quick add from library
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {labelPresets
                .filter((p) => !labels.includes(p.name))
                .map((preset) => (
                  <Badge
                    key={preset.name}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-muted"
                    onClick={() => onAddLabel(preset.name)}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1.5 inline-block"
                      style={{ backgroundColor: preset.color }}
                    />
                    {preset.name}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={!selectedModel || labels.length === 0}>
          Review & Confirm
        </Button>
      </div>
    </div>
  );
}
