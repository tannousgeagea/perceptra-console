import React from "react"
import Badge from './ui/Badge';
import { TrainingSession } from "@/types/training_session";
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ProgressBar from './ui/ProgressBar';
import { Link } from 'react-router-dom';

interface SessionHeaderProps {
  session: TrainingSession | undefined;
  projectId: string;
}


const SessionHeader: React.FC<SessionHeaderProps> = ({ session, projectId }) => {
if (!session) return null
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Link to={`/projects/${projectId}/sessions`} className="inline-flex items-center text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to sessions
            </Link>
            <Badge status={session.status} />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{session.modelName}</h2>
                <p className="text-gray-600 mt-1">{session.projectName}</p>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Created: {formatDate(session.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Time: {formatTime(session.createdAt)}</span>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Progress</p>
                <ProgressBar progress={session.progress} status={session.status} />
                <p className="text-xs text-gray-500 mt-1 text-right">{session.progress}% complete</p>
            </div>
        </div>
    </div>
  );
}

export default SessionHeader