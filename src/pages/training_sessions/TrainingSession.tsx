import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionFilters from '@/components/training_sessions/SearchFilters';
import SessionList from '@/components/training_sessions/SessionList';
import { projects, models } from '@/components/training_sessions/mockData';
import { TrainingSession } from '@/types/training_session';
import { useTrainingSessions } from '@/hooks/useTrainingSessions';
import { Loader2, AlertTriangle } from 'lucide-react';

const SessionsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading, isError, error } = useTrainingSessions({
    projectId: projectId,
    modelId: selectedModel || undefined,
    search: searchQuery || undefined,
    status: selectedStatus || undefined,
    limit: 50,
    offset: 0,
  });

  const isFiltered =
    searchQuery !== '' || selectedProject !== '' || selectedModel !== '' || selectedStatus !== '';

  const handleViewSession = (session: TrainingSession) => {
    navigate(`/projects/${projectId}/sessions/${session.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedProject('');
    setSelectedModel('');
    setSelectedStatus('');
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Training Sessions</h1>
            {data?.total !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {data.total} session{data.total !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </div>
        <SessionFilters
          projects={projects}
          models={models}
          searchQuery={searchQuery}
          selectedProject={selectedProject}
          selectedModel={selectedModel}
          selectedStatus={selectedStatus}
          onSearchChange={setSearchQuery}
          onProjectChange={setSelectedProject}
          onModelChange={setSelectedModel}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin h-6 w-6 mr-3" />
          Loading sessions…
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-sm text-red-600 dark:text-red-400">
            {(error as Error).message}
          </p>
        </div>
      ) : (
        <SessionList
          sessions={data?.results ?? []}
          isFiltered={isFiltered}
          onViewSession={handleViewSession}
          onClearFilters={handleClearFilters}
        />
      )}
    </div>
  );
};

export default SessionsPage;
