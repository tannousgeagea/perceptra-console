import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/ui/tooltip';
import { Search, Plus } from 'lucide-react';
import { ScanStatsBar } from '@/components/similarity/ScanStatsBar';
import { ScanListToolbar } from '@/components/similarity/ScanListToolbar';
import { ScanRow } from '@/components/similarity/ScanRow';
import { PaginationControls } from "@/components/ui/ui/pagination-control";
import { ScanConfigDrawer } from '@/components/similarity/ScanConfigDrawer';
import { useScans, useSimilarityStats, useCreateScan } from '@/hooks/useSimilarity';
import type { ScanHistoryStatus, HashAlgorithm, ScanConfig, ScanSummary } from '@/types/similarity';

const NEW_SCAN_CONFIG: ScanConfig = { scope: 'datalake', threshold: 0.8, algorithm: 'ahash' };

export default function ScanHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Scan settings drawer: "New Scan" opens it for the datalake; "Re-run"
  // opens it with that scan's settings and scope (project or datalake).
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerConfig, setDrawerConfig] = useState<ScanConfig>(NEW_SCAN_CONFIG);
  const createScan = useCreateScan({ onSuccess: () => setDrawerOpen(false) });

  const openNewScan = () => {
    setDrawerConfig(NEW_SCAN_CONFIG);
    setDrawerOpen(true);
  };
  const openRerun = (scan: ScanSummary) => {
    setDrawerConfig({
      scope: scan.scope,
      dataset_id: scan.project_id ?? undefined,
      threshold: scan.similarity_threshold,
      algorithm: scan.algorithm,
    });
    setDrawerOpen(true);
  };
  const startScan = () => {
    createScan.mutate({
      scope: drawerConfig.scope,
      project_id: drawerConfig.scope === 'project' ? drawerConfig.dataset_id : undefined,
      algorithm: drawerConfig.algorithm,
      similarity_threshold: drawerConfig.threshold,
    });
  };

  // Read filters from URL
  const activeStatus = (searchParams.get('status') ?? 'all') as ScanHistoryStatus | 'all';
  const scope = (searchParams.get('scope') ?? 'all') as 'all' | 'datalake' | 'project';
  const algorithm = (searchParams.get('algorithm') ?? 'all') as HashAlgorithm | 'all';
  const skip = Number(searchParams.get('skip') ?? '0');
  const limit = Number(searchParams.get('limit') ?? '20');
  const currentPage = Math.floor(skip / limit) + 1;

  // Queries
  const { data: stats, isLoading: statsLoading } = useSimilarityStats();
  const {
    data: scansData,
    isLoading: scansLoading,
    refetch,
  } = useScans(
    {
      status: activeStatus === 'all' ? undefined : activeStatus,
      scope: scope === 'all' ? undefined : scope,
      algorithm: algorithm === 'all' ? undefined : algorithm,
    },
    { skip, limit }
  );

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Reset pagination on filter change
      if (key !== 'skip' && key !== 'limit') {
        next.delete('skip');
      }
      return next;
    });
  };

  const isRunning = (stats?.scans.running ?? 0) > 0;
  const scans = scansData?.scans ?? [];
  const total = scansData?.total ?? 0;

  return (
    <div className="w-full space-y-6 p-4 lg:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          <p className="text-sm text-muted-foreground">
            Perceptual similarity scans for your organization
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled={isRunning} onClick={openNewScan}>
                <Plus className="mr-2 h-4 w-4" />
                New Scan
              </Button>
            </span>
          </TooltipTrigger>
          {isRunning && <TooltipContent>A scan is already running</TooltipContent>}
        </Tooltip>
      </div>

      {/* Stats bar */}
      <ScanStatsBar stats={stats} isLoading={statsLoading} />

      {/* Toolbar */}
      <ScanListToolbar
        activeStatus={activeStatus}
        onStatusChange={(s) => setParam('status', s)}
        scope={scope}
        onScopeChange={(s) => setParam('scope', s)}
        algorithm={algorithm}
        onAlgorithmChange={(a) => setParam('algorithm', a)}
        onRefresh={() => refetch()}
      />

      {/* Scan list */}
      {scansLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border bg-muted/50" />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/40" />
          {activeStatus === 'all' && scope === 'all' && algorithm === 'all' ? (
            <>
              <h3 className="text-lg font-semibold text-foreground">No scans yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Run your first similarity scan to detect duplicate images in your datalake.
              </p>
              <Button className="mt-4" onClick={openNewScan}>
                Run First Scan
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-foreground">No scans match your filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try clearing the status or scope filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <ScanRow
              key={scan.scan_id}
              scan={scan}
              autoExpand={scan.status === 'running'}
              onRerun={openRerun}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={(page) => setParam('skip', String((page - 1) * limit))}
          onItemsPerPageChange={(size) => {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('limit', String(size));
              next.delete('skip');
              return next;
            });
          }}
          itemsPerPageOptions={[20, 50, 100]}
        />
      )}

      <ScanConfigDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        config={drawerConfig}
        onConfigChange={(cfg) => setDrawerConfig((prev) => ({ ...prev, ...cfg }))}
        activeScan={null}
        onStartScan={startScan}
        onCancelScan={() => {}}
        projectId={drawerConfig.scope === 'project' ? drawerConfig.dataset_id : undefined}
        starting={createScan.isPending}
      />
    </div>
  );
}
