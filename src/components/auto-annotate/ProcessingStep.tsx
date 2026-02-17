import { AutoAnnotateSession } from '@/types/auto-annotate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Progress } from '@/components/ui/ui/progress';
import { Badge } from '@/components/ui/ui/badge';
import { Pause, Play, XCircle, CheckCircle, AlertTriangle, Clock, ImageIcon, Tag } from 'lucide-react';

interface Props {
  session: AutoAnnotateSession;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function ProcessingStep({ session, onPause, onResume, onCancel }: Props) {
  const progress = session.totalImages > 0
    ? Math.round((session.processedImages / session.totalImages) * 100)
    : 0;

  const isPaused = session.status === 'paused';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isPaused ? 'Paused' : 'Processing...'}
            </CardTitle>
            <Badge variant={isPaused ? 'secondary' : 'default'}>
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Image {session.processedImages} of {session.totalImages}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Current image */}
          {session.currentImageUrl && (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <img
                src={session.currentImageUrl}
                alt={session.currentImageName}
                className="h-16 w-24 rounded object-cover border"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              <div>
                <p className="text-sm font-medium">{session.currentImageName}</p>
                <p className="text-xs text-muted-foreground">Currently processing</p>
              </div>
            </div>
          )}

          {/* Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-lg font-semibold">{session.successCount}</p>
                <p className="text-[10px] text-muted-foreground">Successful</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-semibold">{session.failedCount}</p>
                <p className="text-[10px] text-muted-foreground">Failed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-semibold">{session.totalAnnotationsCreated}</p>
                <p className="text-[10px] text-muted-foreground">Annotations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">{formatDuration(session.estimatedRemainingSeconds)}</p>
                <p className="text-[10px] text-muted-foreground">Remaining</p>
              </div>
            </div>
          </div>

          {/* Time info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Elapsed: {formatDuration(session.elapsedSeconds)}</span>
            <span>Model: {session.modelName}</span>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            {isPaused ? (
              <Button onClick={onResume} variant="default" className="gap-2">
                <Play className="h-4 w-4" /> Resume
              </Button>
            ) : (
              <Button onClick={onPause} variant="secondary" className="gap-2">
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            <Button onClick={onCancel} variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
