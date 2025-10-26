import React from 'react';
import { useAnnotation } from '@/contexts/AnnotationContext';


const LabelPanel: React.FC = () => {
  const { boxes } = useAnnotation();

  // 1. Group boxes by label
  const labelGroups = boxes.reduce((acc, box) => {
    const label = box.label || "Unlabeled";
    if (!acc[label]) {
      acc[label] = {
        count: 0,
        color: box.color || "#ccc",
      };
    }
    acc[label].count += 1;
    return acc;
  }, {} as Record<string, { count: number; color: string }>);

  // 2. Convert labelGroups object into an array
  const labelArray = Object.entries(labelGroups).map(([label, info]) => ({
    label,
    count: info.count,
    color: info.color,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">Labels</h3>
      {labelArray.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Draw boxes to start annotating
        </p>
      ) : (
        <div className="space-y-2">
          {labelArray.map(({ label, count, color }) => (
            <div
              key={label}
              className="
                flex items-center justify-between
                p-2 rounded
                hover:bg-accent/50
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
              </div>
              <span className="text-sm text-muted-foreground rounded-full">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabelPanel;
