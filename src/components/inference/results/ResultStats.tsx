import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ui/card';

interface ResultStatsProps {
  data: any;
  title: string;
}

export const ResultStats: React.FC<ResultStatsProps> = ({ data, title }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Model</p>
          <p className="font-medium">{data?.model || 'Unknown'}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Detections</p>
          <p className="font-medium">{data?.detections || 0}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Confidence</p>
          <p className="font-medium">{data?.confidence ? (data.confidence * 100).toFixed(1) : 0}%</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Time</p>
          <p className="font-medium">{data?.processingTime ? data.processingTime.toFixed(2) : 0}s</p>
        </div>
      </div>
    </CardContent>
  </Card>
);