import { AutoAnnotateSession, GeneratedAnnotation } from '@/types/auto-annotate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Badge } from '@/components/ui/ui/badge';
import { Separator } from '@/components/ui/ui/separator';
import { CheckCircle, XCircle, ImageIcon, Tag, Clock, RotateCcw, Eye } from 'lucide-react';

interface Props {
  session: AutoAnnotateSession;
  annotations: GeneratedAnnotation[];
  onReview: () => void;
  onNewSession: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function CompletionSummary({ session, annotations, onReview, onNewSession }: Props) {
  const successRate = session.totalImages > 0
    ? Math.round((session.successCount / session.totalImages) * 100)
    : 0;
  const accepted = annotations.filter((a) => a.reviewStatus === 'accepted').length;
  const rejected = annotations.filter((a) => a.reviewStatus === 'rejected').length;
  const pending = annotations.filter((a) => a.reviewStatus === 'pending').length;
  const isCancelled = session.status === 'cancelled';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center pb-2">
          {isCancelled ? (
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
          ) : (
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
          )}
          <CardTitle className="text-lg">
            {isCancelled ? 'Auto-Annotation Cancelled' : 'Auto-Annotation Complete'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {session.modelName}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <ImageIcon className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{session.processedImages}</p>
              <p className="text-xs text-muted-foreground">Images processed</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Tag className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{session.totalAnnotationsCreated}</p>
              <p className="text-xs text-muted-foreground">Annotations created</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success rate</span>
              <Badge
                variant={successRate >= 90 ? 'default' : 'secondary'}
                className={successRate >= 90 ? 'bg-emerald-500' : ''}
              >
                {successRate}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed images</span>
              <span>{session.failedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing time</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatDuration(session.elapsedSeconds)}
              </span>
            </div>
          </div>

          {annotations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Review Status</p>
                <div className="flex gap-3">
                  <Badge variant="default" className="bg-emerald-500 text-white">{accepted} accepted</Badge>
                  <Badge variant="destructive">{rejected} rejected</Badge>
                  <Badge variant="secondary">{pending} pending</Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        {annotations.length > 0 && (
          <Button variant="outline" onClick={onReview} className="gap-2">
            <Eye className="h-4 w-4" /> Review Annotations
          </Button>
        )}
        <Button onClick={onNewSession} className="gap-2">
          <RotateCcw className="h-4 w-4" /> New Session
        </Button>
      </div>
    </div>
  );
}
