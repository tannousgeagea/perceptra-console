import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import SessionFilters from '@/components/training_sessions/SearchFilters';
import SessionList from '@/components/training_sessions/SessionList';
import { TrainingSession } from '@/types/training_session';
import { useTrainingSessions } from '@/hooks/useTrainingSessions';
import { useProjectModels } from '@/hooks/useModels';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import { Loader2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

const PAGE_SIZES = [10, 20, 50, 100];

const SessionsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Filters and page live in the URL: links and the back button keep them.
  const [params, setParams] = useSearchParams();
  const searchQuery = params.get('q') ?? '';
  const selectedModel = params.get('model') ?? '';
  const selectedStatus = params.get('status') ?? '';
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const pageSize = PAGE_SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : 20;

  const update = (changes: Record<string, string>, resetPage = true) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (resetPage) next.delete('page');
      return next;
    }, { replace: true });

  const { data: models } = useProjectModels(projectId ?? '');
  const { data, isLoading, isError, error } = useTrainingSessions({
    projectId,
    // Exact model match (model_id); the search box still matches names.
    modelUuid: selectedModel || undefined,
    search: searchQuery || undefined,
    status: selectedStatus || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const isFiltered = searchQuery !== '' || selectedModel !== '' || selectedStatus !== '';
  const total = data?.total ?? 0;

  const handleViewSession = (session: TrainingSession) => {
    navigate(`/projects/${projectId}/sessions/${session.id}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <PageHeader
          className="mb-6"
          title="Training Sessions"
          description={data ? `${total} session${total !== 1 ? 's' : ''}${isFiltered ? ' match these filters' : ' total'}` : undefined}
        />
        <SessionFilters
          models={(models ?? []).map((m) => ({ id: m.id, name: m.name }))}
          searchQuery={searchQuery}
          selectedModel={selectedModel}
          selectedStatus={selectedStatus}
          onSearchChange={(q) => update({ q })}
          onModelChange={(model) => update({ model })}
          onStatusChange={(status) => update({ status })}
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
        <>
          <SessionList
            sessions={data?.results ?? []}
            isFiltered={isFiltered}
            onViewSession={handleViewSession}
            onClearFilters={() => update({ q: '', model: '', status: '' })}
          />
          {total > pageSize && (
            <div className="mt-6">
              <PaginationControls
                currentPage={page}
                totalItems={total}
                itemsPerPage={pageSize}
                itemsPerPageOptions={PAGE_SIZES}
                onPageChange={(p) => update({ page: p > 1 ? String(p) : '' }, false)}
                onItemsPerPageChange={(size) => update({ size: size === 20 ? '' : String(size) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionsPage;
