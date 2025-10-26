import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SessionFilters from '@/components/training_sessions/SearchFilters';
import SessionList from '@/components/training_sessions/SessionList';
import { projects,  models } from '@/components/training_sessions/mockData';
import { TrainingSession } from '@/types/training_session';
import { useTrainingSessions } from '@/hooks/useTrainingSessions';
import { Loader2 } from 'lucide-react';

const SessionsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const {
    data,
    isLoading,
    isError,
    error
  } = useTrainingSessions({
    projectId: projectId,
    modelId: selectedModel || undefined,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  const isFiltered = searchQuery !== '' || selectedProject !== '' || selectedModel !== '' || selectedStatus !== '';
  const handleViewSession = (session: TrainingSession) => {
    navigate(`/projects/${projectId}/sessions/${session.id}`)
  }
  
  return (
    <div className="space-y-6 p-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Training Sessions</h1>
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
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Loading sessions...
        </div>
      ) : isError ? (
        <p className="text-red-600">Error: {(error as Error).message}</p>
      ) : (
        <SessionList sessions={data?.results || []} isFiltered={isFiltered} onViewSession={handleViewSession} />
      )}
    </div>
  );
};

export default SessionsPage;