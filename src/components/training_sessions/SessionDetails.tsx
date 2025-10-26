import React from 'react';
import { TrainingSession } from '@/types/training_session'
import MetricCard from './ui/MetricCard';
import MetricsVisualization from './MetricsVisualization';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface SessionDetailProps {
  session: TrainingSession | undefined;
}

const SessionDetail: React.FC<SessionDetailProps> = ({ session }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  if (!session) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Session with ID {sessionId} not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to sessions list
          </Link>
        </div>
      </div>
    );
  }

  const metricsData = session?.metricsData || []
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {metricsData.length > 0 && (
            <div className="mb-8">
              <MetricsVisualization
                data={metricsData}
                // metrics={['loss', 'accuracy', 'precision', 'recall', 'mAP']}
              />
            </div>
          )}

          {session.metrics && Object.keys(session.metrics).length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {session.metrics.accuracy && (
                  <MetricCard label="Accuracy" value={session.metrics.accuracy} suffix="%" />
                )}
                {session.metrics.f1Score && (
                  <MetricCard label="F1 Score" value={session.metrics.f1Score} suffix="%" />
                )}
                {session.metrics.precision && (
                  <MetricCard label="Precision" value={session.metrics.precision} suffix="%" />
                )}
                {session.metrics.recall && (
                  <MetricCard label="Recall" value={session.metrics.recall} suffix="%" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            {session.status === 'failed' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <RefreshCw className="w-4 h-4 mr-1" /> Retry Training
              </button>
            )}
            {session.status === 'completed' && (
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <Download className="w-4 h-4 mr-1" /> Download Model
              </button>
            )}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="w-4 h-4 mr-1" /> Export Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;