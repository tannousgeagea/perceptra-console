import { useState, useMemo } from 'react';
import { GeneratedAnnotation } from '@/types/auto-annotate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Slider } from '@/components/ui/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Label } from '@/components/ui/ui/label';
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCheck,
  XCircle,
} from 'lucide-react';

interface Props {
  annotations: GeneratedAnnotation[];
  confidenceThreshold: number;
  onConfidenceChange: (v: number) => void;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => void;
  onBulkAccept: (threshold: number) => void;
  onBulkReject: (threshold: number) => void;
  onDone: () => void;
}

export function ReviewStep({
  annotations,
  confidenceThreshold,
  onConfidenceChange,
  onUpdateStatus,
  onBulkAccept,
  onBulkReject,
  onDone,
}: Props) {
  const [labelFilter, setLabelFilter] = useState('all');
  const [statusFilterVal, setStatusFilterVal] = useState('all');
  const [currentIdx, setCurrentIdx] = useState(0);

  const allLabels = useMemo(() => Array.from(new Set(annotations.map((a) => a.label))), [annotations]);

  const filtered = useMemo(() => {
    return annotations.filter((a) => {
      if (a.confidence < confidenceThreshold) return false;
      if (labelFilter !== 'all' && a.label !== labelFilter) return false;
      if (statusFilterVal !== 'all' && a.reviewStatus !== statusFilterVal) return false;
      return true;
    });
  }, [annotations, confidenceThreshold, labelFilter, statusFilterVal]);

  // Group by image
  const imageGroups = useMemo(() => {
    const groups: Record<string, GeneratedAnnotation[]> = {};
    filtered.forEach((a) => {
      if (!groups[a.imageId]) groups[a.imageId] = [];
      groups[a.imageId].push(a);
    });
    return Object.entries(groups);
  }, [filtered]);

  const currentGroup = imageGroups[currentIdx];

  const stats = useMemo(() => {
    const total = annotations.length;
    const accepted = annotations.filter((a) => a.reviewStatus === 'accepted').length;
    const rejected = annotations.filter((a) => a.reviewStatus === 'rejected').length;
    const pending = annotations.filter((a) => a.reviewStatus === 'pending').length;
    return { total, accepted, rejected, pending };
  }, [annotations]);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/50 rounded-lg px-4 py-2 text-sm">
        <span className="font-medium">{stats.total} annotations</span>
        <Badge variant="default" className="bg-emerald-500 text-white">{stats.accepted} accepted</Badge>
        <Badge variant="destructive">{stats.rejected} rejected</Badge>
        <Badge variant="secondary">{stats.pending} pending</Badge>
        <span className="ml-auto text-muted-foreground">
          {imageGroups.length} image{imageGroups.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" /> Filters & Bulk Actions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Confidence ≥ {confidenceThreshold}%</Label>
              <Slider
                value={[confidenceThreshold]}
                onValueChange={([v]) => onConfidenceChange(v)}
                min={0}
                max={100}
                step={5}
              />
            </div>
            <Select value={labelFilter} onValueChange={setLabelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All labels</SelectItem>
                {allLabels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilterVal} onValueChange={setStatusFilterVal}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => onBulkAccept(confidenceThreshold)}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Accept all ≥ {confidenceThreshold}%
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => onBulkReject(confidenceThreshold)}
            >
              <XCircle className="h-3.5 w-3.5" /> Reject all &lt; {confidenceThreshold}%
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image review */}
      {currentGroup ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {currentGroup[1][0]?.imageName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => i - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIdx + 1} / {imageGroups.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentIdx === imageGroups.length - 1}
                  onClick={() => setCurrentIdx((i) => i + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image */}
              <div>
                <img
                  src={currentGroup[1][0]?.imageUrl}
                  alt={currentGroup[1][0]?.imageName}
                  className="w-full rounded-lg border object-cover max-h-[320px]"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                />
              </div>
              {/* Annotations */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {currentGroup[1].map((ann) => (
                  <div
                    key={ann.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      ann.reviewStatus === 'accepted'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : ann.reviewStatus === 'rejected'
                        ? 'bg-destructive/10 border-destructive/30'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ann.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {ann.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {ann.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant={ann.reviewStatus === 'accepted' ? 'default' : 'ghost'}
                        className="h-7 w-7"
                        onClick={() => onUpdateStatus(ann.id, 'accepted')}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant={ann.reviewStatus === 'rejected' ? 'destructive' : 'ghost'}
                        className="h-7 w-7"
                        onClick={() => onUpdateStatus(ann.id, 'rejected')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No annotations match the current filters.
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onDone}>Done Reviewing</Button>
      </div>
    </div>
  );
}
