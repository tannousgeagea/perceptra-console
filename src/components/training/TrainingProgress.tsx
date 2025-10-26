import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";

interface TrainingProgressProps {
  log: string[];
  progress: number;
  isTraining: boolean;
}

const TrainingProgress: React.FC<TrainingProgressProps> = ({ log, progress, isTraining }) => {
  const currentTime = () => new Date().toLocaleTimeString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Progress</CardTitle>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardDescription>{progress}% complete</CardDescription>
      </CardHeader>

      <CardContent className="max-h-64 overflow-auto">
        <div className="bg-muted/50 p-4 rounded-md font-mono text-sm">
          {log.map((line, index) => (
            <div key={index} className="pb-1">
              <span className="text-muted-foreground">[{currentTime()}]</span> {line}
            </div>
          ))}

          {isTraining && (
            <div className="animate-pulse">
              <span className="text-muted-foreground">[{currentTime()}]</span> _
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingProgress;
