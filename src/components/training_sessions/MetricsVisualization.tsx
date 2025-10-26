import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Download } from 'lucide-react';

interface MetricPoint {
  epoch: number;
  [key: string]: number;
}

interface MetricsVisualizationProps {
  data: MetricPoint[];
  metrics?: string[]; // Optional, fallback to keys of data[0]
}

const defaultColors: Record<string, string> = {
  loss: '#EF4444',
  val_loss: '#F97316',
  accuracy: '#10B981',
  val_accuracy: '#059669',
  precision: '#6366F1',
  recall: '#8B5CF6',
  f1Score: '#EC4899'
};

// Generate a random color if not in defaultColors
const generateRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

const MetricsVisualization: React.FC<MetricsVisualizationProps> = ({ data, metrics }) => {
  // Dynamically determine metrics if not provided
  const availableMetrics = useMemo(() => {
    if (metrics && metrics.length > 0) return metrics;
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => key !== 'epoch');
  }, [data, metrics]);

  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set(availableMetrics));

  // Create a dynamic color mapping
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    availableMetrics.forEach((metric) => {
      map[metric] = defaultColors[metric] || generateRandomColor();
    });
    return map;
  }, [availableMetrics]);

  const toggleMetric = (metric: string) => {
    const newVisibleMetrics = new Set(visibleMetrics);
    if (newVisibleMetrics.has(metric)) {
      newVisibleMetrics.delete(metric);
    } else {
      newVisibleMetrics.add(metric);
    }
    setVisibleMetrics(newVisibleMetrics);
  };

  const downloadChart = () => {
    const svgElement = document.querySelector('.recharts-wrapper svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'training_metrics.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Training Metrics</h3>
        <button
          onClick={downloadChart}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Chart
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {availableMetrics.map((metric) => (
          <button
            key={metric}
            onClick={() => toggleMetric(metric)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              visibleMetrics.has(metric)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      {availableMetrics.length === 0 ? (
        <p className="text-gray-500 text-sm">No metrics to display.</p>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="epoch"
                label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {availableMetrics.map(
                (metric) =>
                  visibleMetrics.has(metric) && (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={colorMap[metric]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MetricsVisualization;
