import React from 'react';
import SearchBar from './ui/SearchBar';
import SelectFilter from './ui/SelectFilter';

interface Option {
  id: string;
  name: string;
}

interface SessionFiltersProps {
  /** This project's models (id = model_id). */
  models: Option[];
  searchQuery: string;
  selectedModel: string;
  selectedStatus: string;
  onSearchChange: (query: string) => void;
  onModelChange: (modelId: string) => void;
  onStatusChange: (status: string) => void;
}

const STATUS_OPTIONS: Option[] = [
  { id: 'pending', name: 'Pending' },
  { id: 'queued', name: 'Queued' },
  { id: 'initializing', name: 'Initializing' },
  { id: 'running', name: 'Running' },
  { id: 'completed', name: 'Completed' },
  { id: 'failed', name: 'Failed' },
  { id: 'cancelled', name: 'Cancelled' },
];

const SessionFilters: React.FC<SessionFiltersProps> = ({
  models,
  searchQuery,
  selectedModel,
  selectedStatus,
  onSearchChange,
  onModelChange,
  onStatusChange,
}) => (
  <div className="space-y-4 md:flex md:items-end md:space-x-4 md:space-y-0">
    <div className="md:w-1/3">
      <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search by model name..." />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:flex-1">
      <SelectFilter label="Model" options={models} value={selectedModel} onChange={onModelChange} />
      <SelectFilter label="Status" options={STATUS_OPTIONS} value={selectedStatus} onChange={onStatusChange} />
    </div>
  </div>
);

export default SessionFilters;
