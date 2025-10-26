import React from 'react';
import SearchBar from './ui/SearchBar';
import SelectFilter from './ui/SelectFilter';
import { Project, Model, Status  } from '@/types/training_session';

interface SessionFiltersProps {
  projects: Project[];
  models: Model[];
  searchQuery: string;
  selectedProject: string;
  selectedModel: string;
  selectedStatus: string;
  onSearchChange: (query: string) => void;
  onProjectChange: (projectId: string) => void;
  onModelChange: (modelId: string) => void;
  onStatusChange: (status: string) => void;
}

const SessionFilters: React.FC<SessionFiltersProps> = ({
  projects,
  models,
  searchQuery,
  selectedProject,
  selectedModel,
  selectedStatus,
  onSearchChange,
  onProjectChange,
  onModelChange,
  onStatusChange,
}) => {
  const statusOptions = [
    { id: 'running', name: 'Running' },
    { id: 'completed', name: 'Completed' },
    { id: 'failed', name: 'Failed' },
    { id: 'pending', name: 'Pending' },
  ];

  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
      <div className="md:w-1/3">
        <SearchBar 
          value={searchQuery} 
          onChange={onSearchChange} 
          placeholder="Search by model name..." 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:flex-1">
        {/* <SelectFilter
          label="Project"
          options={projects}
          value={selectedProject}
          onChange={onProjectChange}
        />
        
        <SelectFilter
          label="Model"
          options={models}
          value={selectedModel}
          onChange={onModelChange}
        /> */}
        
        <SelectFilter
          label="Status"
          options={statusOptions}
          value={selectedStatus}
          onChange={onStatusChange}
        />
      </div>
    </div>
  );
};

export default SessionFilters;