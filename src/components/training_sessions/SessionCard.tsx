import React from 'react';
import { TrainingSession } from '@/types/training_session';
import Badge from './ui/Badge';
import ProgressBar from './ui/ProgressBar';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/ui/button";

interface SessionCardProps {
  session: TrainingSession;
  onViewSession: (session: TrainingSession) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onViewSession }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{session.modelName}</h3>
            <p className="text-sm text-gray-600">{session.projectName}</p>
          </div>
          <Badge status={session.status} />
        </div>

        <div className="mb-4">
          <ProgressBar progress={session.progress} status={session.status} />
          <p className="text-xs text-gray-500 mt-1 text-right">{session.progress}% complete</p>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="mr-3">Created: {formatDate(session.createdAt)}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>Time: {formatTime(session.createdAt)}</span>
        </div>

        {session.metrics && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {session.metrics.accuracy && (
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-xs text-gray-500">Accuracy</p>
                <p className="text-sm font-medium">{(session.metrics.accuracy * 100).toFixed(1)}%</p>
              </div>
            )}
            {session.metrics.f1Score && (
              <div className="bg-gray-50 rounded p-2 text-center">
                <p className="text-xs text-gray-500">F1 Score</p>
                <p className="text-sm font-medium">{(session.metrics.f1Score * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}

        <Button
          // to={`/sessions/${session.id}`}
          onClick={() => onViewSession(session)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default SessionCard;