import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import { Badge } from "@/components/ui/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import type { VersionStats } from "@/types/analytics";

interface VersionComparisonProps {
  versions: VersionStats[];
  selectedVersions: [string, string];
  onVersionChange: (index: 0 | 1, versionId: string) => void;
}

export const VersionComparison = ({
  versions,
  selectedVersions,
  onVersionChange,
}: VersionComparisonProps) => {
  const version1 = versions.find((v) => v.id === selectedVersions[0]);
  const version2 = versions.find((v) => v.id === selectedVersions[1]);

  if (!version1 || !version2) return null;

  const calculateDiff = (val1: number, val2: number) => {
    const diff = val2 - val1;
    const percentDiff = val1 > 0 ? ((diff / val1) * 100).toFixed(1) : "N/A";
    return { diff, percentDiff };
  };

  const renderDiffBadge = (diff: number, percentDiff: string) => {
    if (diff === 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <MinusIcon className="h-3 w-3" />
          No change
        </Badge>
      );
    }
    return (
      <Badge variant={diff > 0 ? "default" : "destructive"} className="gap-1">
        {diff > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
        {Math.abs(diff)} ({percentDiff}%)
      </Badge>
    );
  };

  const imageDiff = calculateDiff(version1.total_images, version2.total_images);
  const annotationDiff = calculateDiff(version1.total_annotations, version2.total_annotations);
  const avgAnnotationsPerImage1 = version1.total_images > 0 
    ? (version1.total_annotations / version1.total_images).toFixed(2) 
    : "0";
  const avgAnnotationsPerImage2 = version2.total_images > 0 
    ? (version2.total_annotations / version2.total_images).toFixed(2) 
    : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version Comparison</CardTitle>
        <CardDescription>Compare two dataset versions side by side</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Version Selectors */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Version 1</label>
            <Select value={selectedVersions[0]} onValueChange={(v) => onVersionChange(0, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === selectedVersions[1]}>
                    {v.version_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Version 2</label>
            <Select value={selectedVersions[1]} onValueChange={(v) => onVersionChange(1, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id} disabled={v.id === selectedVersions[0]}>
                    {v.version_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="space-y-4">
          {/* Images */}
          <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Images</p>
              <p className="text-2xl font-bold">{version1.total_images}</p>
            </div>
            <div className="flex items-center justify-center">
              {renderDiffBadge(imageDiff.diff, imageDiff.percentDiff)}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Images</p>
              <p className="text-2xl font-bold">{version2.total_images}</p>
            </div>
          </div>

          {/* Annotations */}
          <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Annotations</p>
              <p className="text-2xl font-bold">{version1.total_annotations}</p>
            </div>
            <div className="flex items-center justify-center">
              {renderDiffBadge(annotationDiff.diff, annotationDiff.percentDiff)}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Annotations</p>
              <p className="text-2xl font-bold">{version2.total_annotations}</p>
            </div>
          </div>

          {/* Avg Annotations per Image */}
          <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Annotations/Image</p>
              <p className="text-2xl font-bold">{avgAnnotationsPerImage1}</p>
            </div>
            <div className="flex items-center justify-center">
              <Badge variant="outline">Metric</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Avg Annotations/Image</p>
              <p className="text-2xl font-bold">{avgAnnotationsPerImage2}</p>
            </div>
          </div>

          {/* Split Distribution */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <p className="font-medium">{version1.version_name} Split</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Train:</span>
                  <span className="font-medium">{version1.by_split.train}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validation:</span>
                  <span className="font-medium">{version1.by_split.val}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test:</span>
                  <span className="font-medium">{version1.by_split.test}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <p className="font-medium">{version2.version_name} Split</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Train:</span>
                  <span className="font-medium">{version2.by_split.train}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validation:</span>
                  <span className="font-medium">{version2.by_split.val}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test:</span>
                  <span className="font-medium">{version2.by_split.test}</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Size & Format */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Export Format:</span>
                <Badge>{version1.export_format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">File Size:</span>
                <span className="font-medium">{version1.file_size_mb ? `${version1.file_size_mb} MB` : "N/A"}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Export Format:</span>
                <Badge>{version2.export_format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">File Size:</span>
                <span className="font-medium">{version2.file_size_mb ? `${version2.file_size_mb} MB` : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};