import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/ui/dialog";
import { Button } from "@/components/ui/ui/button";
import { Label } from "@/components/ui/ui/label";
import { Input } from "@/components/ui/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Switch } from "@/components/ui/ui/switch";
import { Slider } from "@/components/ui/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/ui/accordion";
import { ExportConfig, DatasetVersion } from "@/types/version";
import { Download, Settings, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/ui/separator";

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: DatasetVersion | null;
  onExport: (config: ExportConfig) => void;
}

export function ExportConfigDialog({ open, onOpenChange, version, onExport }: ExportConfigDialogProps) {
  const [config, setConfig] = useState<ExportConfig>({
    export_format: (version?.export_format || 'yolo') as 'yolo' | 'coco' | 'pascal_voc' | 'tfrecord' | 'custom',
    image_size: undefined,
    image_quality: 95,
    normalize: false,
    include_difficult: true,
    include_predictions: false,
    min_annotation_area: 0,
    augment: false,
    augmentation_factor: 1,
    augmentation_config: {
      horizontal_flip: true,
      vertical_flip: false,
      rotation_limit: 15,
      brightness_contrast: true,
      blur: false,
      noise: false,
    },
  });

  const handleExport = () => {
    onExport(config);
    onOpenChange(false);
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Configuration
          </DialogTitle>
          <DialogDescription>
            Configure export settings for {version.version_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format">
              <Settings className="h-4 w-4 mr-2" />
              Format & Options
            </TabsTrigger>
            <TabsTrigger value="processing">Image Processing</TabsTrigger>
            <TabsTrigger value="augmentation">
              <Sparkles className="h-4 w-4 mr-2" />
              Augmentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="format" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="export_format">Export Format</Label>
              <Select
                value={config.export_format}
                onValueChange={(value) => setConfig({ ...config, export_format: value as 'yolo' | 'coco' | 'pascal_voc' | 'tfrecord' | 'custom' })}
              >
                <SelectTrigger id="export_format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yolo">YOLO</SelectItem>
                  <SelectItem value="coco">COCO JSON</SelectItem>
                  <SelectItem value="pascal_voc">Pascal VOC</SelectItem>
                  <SelectItem value="tfrecord">TFRecord</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Normalize Coordinates</Label>
                  <p className="text-xs text-muted-foreground">
                    Convert coordinates to 0-1 range
                  </p>
                </div>
                <Switch
                  checked={config.normalize}
                  onCheckedChange={(checked) => setConfig({ ...config, normalize: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Difficult Annotations</Label>
                  <p className="text-xs text-muted-foreground">
                    Include annotations marked as difficult
                  </p>
                </div>
                <Switch
                  checked={config.include_difficult}
                  onCheckedChange={(checked) => setConfig({ ...config, include_difficult: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Model Predictions</Label>
                  <p className="text-xs text-muted-foreground">
                    Include annotations from model inference
                  </p>
                </div>
                <Switch
                  checked={config.include_predictions}
                  onCheckedChange={(checked) => setConfig({ ...config, include_predictions: checked })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="min_annotation_area">
                Minimum Annotation Area: {(config.min_annotation_area * 100).toFixed(0)}%
              </Label>
              <Slider
                id="min_annotation_area"
                value={[config.min_annotation_area]}
                onValueChange={([value]) => setConfig({ ...config, min_annotation_area: value })}
                max={1}
                step={0.01}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Filter out annotations smaller than this percentage of image area
              </p>
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image_size">Image Size (pixels)</Label>
              <Input
                id="image_size"
                type="number"
                placeholder="Original size"
                value={config.image_size || ''}
                onChange={(e) => setConfig({ 
                  ...config, 
                  image_size: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                min={128}
                max={4096}
              />
              <p className="text-xs text-muted-foreground">
                Resize images to square dimensions (leave empty to keep original)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_quality">
                Image Quality: {config.image_quality}%
              </Label>
              <Slider
                id="image_quality"
                value={[config.image_quality]}
                onValueChange={([value]) => setConfig({ ...config, image_quality: value })}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                JPEG compression quality (higher = better quality, larger file size)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="augmentation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Data Augmentation</Label>
                <p className="text-xs text-muted-foreground">
                  Generate augmented copies of your dataset
                </p>
              </div>
              <Switch
                checked={config.augment}
                onCheckedChange={(checked) => setConfig({ ...config, augment: checked })}
              />
            </div>

            {config.augment && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="augmentation_factor">
                    Augmentation Factor: {config.augmentation_factor}x
                  </Label>
                  <Slider
                    id="augmentation_factor"
                    value={[config.augmentation_factor]}
                    onValueChange={([value]) => setConfig({ ...config, augmentation_factor: value })}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of augmented copies per image
                  </p>
                </div>

                <Separator />

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="transforms">
                    <AccordionTrigger className="text-sm">
                      Augmentation Transforms
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <Label>Horizontal Flip</Label>
                        <Switch
                          checked={config.augmentation_config.horizontal_flip}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, horizontal_flip: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Vertical Flip</Label>
                        <Switch
                          checked={config.augmentation_config.vertical_flip}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, vertical_flip: checked }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Rotation Limit: ±{config.augmentation_config.rotation_limit}°
                        </Label>
                        <Slider
                          value={[config.augmentation_config.rotation_limit]}
                          onValueChange={([value]) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, rotation_limit: value }
                          })}
                          max={180}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Brightness & Contrast</Label>
                        <Switch
                          checked={config.augmentation_config.brightness_contrast}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, brightness_contrast: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Blur</Label>
                        <Switch
                          checked={config.augmentation_config.blur}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, blur: checked }
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Noise</Label>
                        <Switch
                          checked={config.augmentation_config.noise}
                          onCheckedChange={(checked) => setConfig({
                            ...config,
                            augmentation_config: { ...config.augmentation_config, noise: checked }
                          })}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Dataset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
