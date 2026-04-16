import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  ScanEye,
  Archive,
  Trash2,
  CheckCircle2,
  Layers,
  ImageIcon,
  BarChart3,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/ui/alert-dialog';
import { ScanStatusBadge } from '@/components/similarity/ScanStatusBadge';
import { SimilarityClusterCard } from '@/components/similarity/SimilarityClusterCard';
import { ImageLightbox } from '@/components/similarity/ImageLightbox';
import { PaginationControls } from '@/components/ui/ui/pagination-control';
import {
  useScan,
  useScanResults,
  useClusterAction,
  useBulkClusterAction,
} from '@/hooks/useSimilarity';
import type {
  ClusterResultsFilters,
  ClusterSummary,
  ClusterMember,
  SimilarityCluster,
  SimilarityImage,
  ClusterStatus,
} from '@/types/similarity';
import { HASH_ALGORITHMS } from '@/types/similarity';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Adapters
// ─────────────────────────────────────────────────────────────────────────────

function adaptMember(member: ClusterMember): SimilarityImage {
  return {
    id: member.image.image_id,
    filename: member.image.original_filename || member.image.name,
    url: member.image.download_url ?? '',
    thumbnail_url: member.image.download_url ?? '',
    width: member.image.width,
    height: member.image.height,
    file_size: member.image.file_size,
    upload_date: member.image.created_at,
    similarity_score: member.similarity_score,
    is_representative: member.role === 'representative',
    datasets: [],
  };
}

function adaptCluster(cluster: ClusterSummary): SimilarityCluster {
  return {
    id: cluster.cluster_id,
    images: (cluster.members ?? []).map(adaptMember),
    avg_similarity: cluster.avg_similarity,
    status: cluster.status,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
      <div
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          accent ?? 'bg-primary/10 text-primary'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

export default function ScanResultsPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  // ── Filters / pagination ───────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<ClusterStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<ClusterResultsFilters['sort']>('size_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Lightbox ───────────────────────────────────────────────────────────────
  const [lightboxImages, setLightboxImages] = useState<SimilarityImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ── Confirm dialogs ────────────────────────────────────────────────────────
  const [confirmBulk, setConfirmBulk] = useState<
    'archive_duplicates' | 'delete_duplicates' | null
  >(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: scan, isLoading: scanLoading } = useScan(scanId ?? '', {
    enabled: !!scanId,
  });

  const filters: ClusterResultsFilters = {
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort: sortBy,
  };

  const { data: results, isLoading: resultsLoading } = useScanResults(
    scanId ?? '',
    filters,
    { skip, limit: ITEMS_PER_PAGE },
    { enabled: !!scanId, includeMembers: true }
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const clusterAction = useClusterAction();
  const bulkAction = useBulkClusterAction();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleImageClick = useCallback(
    (cluster: SimilarityCluster, imgIndex: number) => {
      setLightboxImages(cluster.images);
      setLightboxIndex(imgIndex);
      setLightboxOpen(true);
    },
    []
  );

  const handleSetRepresentative = useCallback(
    (clusterId: string, imageId: string) => {
      if (!scanId) return;
      clusterAction.mutate({
        clusterId,
        scanId,
        payload: { action: 'set_representative', new_representative_id: imageId },
      });
    },
    [scanId, clusterAction]
  );

  const handleClusterAction = useCallback(
    (
      clusterId: string,
      action: 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed'
    ) => {
      if (!scanId) return;
      clusterAction.mutate({ clusterId, scanId, payload: { action } });
    },
    [scanId, clusterAction]
  );

  const handleBulkAction = useCallback(
    (action: 'archive_duplicates' | 'delete_duplicates' | 'mark_reviewed') => {
      if (!scanId || selectedIds.size === 0) return;
      bulkAction.mutate(
        { scanId, payload: { cluster_ids: Array.from(selectedIds), action } },
        { onSuccess: () => setSelectedIds(new Set()) }
      );
    },
    [scanId, selectedIds, bulkAction]
  );

  const toggleCluster = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clusters = (results?.clusters ?? []).map(adaptCluster);
  const totalClusters = results?.total_clusters ?? 0;
  const totalDuplicates = results?.total_duplicates ?? 0;
  const algoInfo = HASH_ALGORITHMS.find((a) => a.value === scan?.algorithm);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const isAllSelected =
    clusters.length > 0 && clusters.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clusters.map((c) => c.id)));
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* ── Header banner ─────────────────────────────────────────────────── */}
      <div className="border-b bg-card">
        <div className="px-4 lg:px-6 py-5 space-y-4">
          {/* Back + title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
              onClick={() => navigate('/similarity/scans')}
            >
              <ArrowLeft className="h-4 w-4" />
              Scan History
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--mtx-accent),var(--mtx-primary))]">
                <ScanEye className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">Scan Results</h1>
                  {scan && <ScanStatusBadge status={scan.status} />}
                </div>
                {scanLoading ? (
                  <Skeleton className="mt-1 h-4 w-64" />
                ) : scan ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className="font-mono">{scan.scan_id.slice(0, 8)}…</span>
                    <span className="mx-1.5">·</span>
                    <span className="capitalize">{scan.scope}</span>
                    <span className="mx-1.5">·</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-medium text-foreground">
                          {scan.algorithm}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{algoInfo?.description}</TooltipContent>
                    </Tooltip>
                    <span className="mx-1.5">·</span>
                    {(scan.similarity_threshold * 100).toFixed(0)}% threshold
                    {scan.completed_at && (
                      <>
                        <span className="mx-1.5">·</span>
                        {formatDistanceToNow(new Date(scan.completed_at), { addSuffix: true })}
                      </>
                    )}
                  </p>
                ) : null}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/similarity/scans')}
              className="shrink-0"
            >
              View All Scans
            </Button>
          </div>

          {/* Stats row */}
          {scanLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : scan ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={ImageIcon}
                label="Images Scanned"
                value={scan.total_images.toLocaleString()}
                sub="total in scope"
                accent="bg-primary/10 text-primary"
              />
              <StatCard
                icon={Layers}
                label="Clusters Found"
                value={totalClusters.toLocaleString()}
                sub="similar groups"
                accent="bg-[hsl(172_66%_40%)]/10 text-[hsl(172_66%_40%)]"
              />
              <StatCard
                icon={Users}
                label="Duplicates"
                value={totalDuplicates.toLocaleString()}
                sub="images to review"
                accent="bg-warning/10 text-warning"
              />
              <StatCard
                icon={BarChart3}
                label="Progress"
                value={`${Math.round(scan.progress * 100)}%`}
                sub={
                  scan.completed_at
                    ? `Done ${format(new Date(scan.completed_at), 'MMM d, HH:mm')}`
                    : 'In progress'
                }
                accent="bg-secondary/10 text-secondary-foreground"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Filter + sort */}
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as ClusterStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clusters</SelectItem>
                <SelectItem value="unreviewed">Unreviewed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as ClusterResultsFilters['sort']);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="size_desc">Largest first</SelectItem>
                <SelectItem value="size_asc">Smallest first</SelectItem>
                <SelectItem value="similarity_desc">Highest similarity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Counts */}
          <p className="text-xs text-muted-foreground">
            {totalClusters.toLocaleString()} cluster{totalClusters !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="border-t bg-primary/5 px-4 lg:px-6 py-2 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} cluster{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() => handleBulkAction('mark_reviewed')}
                disabled={bulkAction.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Reviewed
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setConfirmBulk('archive_duplicates')}
                disabled={bulkAction.isPending}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive Duplicates
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => setConfirmBulk('delete_duplicates')}
                disabled={bulkAction.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Duplicates
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs ml-auto"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* ── Cluster list ──────────────────────────────────────────────────── */}
      <div className="px-4 lg:px-6 py-6 space-y-4">
        {resultsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : clusters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <ScanEye className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No clusters found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              {statusFilter !== 'all'
                ? 'No clusters match the selected filter. Try clearing the filter.'
                : 'This scan found no similar image groups.'}
            </p>
            {statusFilter !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setStatusFilter('all')}
              >
                Clear filter
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Select all row */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                className="flex items-center gap-2 hover:text-foreground transition-colors"
                onClick={toggleSelectAll}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    isAllSelected
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-input'
                  )}
                >
                  {isAllSelected && (
                    <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-current">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span>{isAllSelected ? 'Deselect all' : 'Select all on this page'}</span>
              </button>
            </div>

            {clusters.map((cluster, idx) => (
              <SimilarityClusterCard
                key={cluster.id}
                cluster={cluster}
                index={skip + idx}
                context="datalake"
                clusterSelected={selectedIds.has(cluster.id)}
                onToggleCluster={() => toggleCluster(cluster.id)}
                onImageClick={(imgIdx) => handleImageClick(cluster, imgIdx)}
                onArchiveDuplicates={() =>
                  handleClusterAction(cluster.id, 'archive_duplicates')
                }
                onDeleteDuplicates={() =>
                  handleClusterAction(cluster.id, 'delete_duplicates')
                }
                onMarkReviewed={() =>
                  handleClusterAction(cluster.id, 'mark_reviewed')
                }
                onSetRepresentative={(imageId) =>
                  handleSetRepresentative(cluster.id, imageId)
                }
              />
            ))}

            {totalClusters > ITEMS_PER_PAGE && (
              <PaginationControls
                currentPage={currentPage}
                totalItems={totalClusters}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setSelectedIds(new Set());
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onItemsPerPageChange={() => {}}
                itemsPerPageOptions={[ITEMS_PER_PAGE]}
              />
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />

      {/* ── Confirm dialogs ────────────────────────────────────────────────── */}
      <AlertDialog
        open={confirmBulk !== null}
        onOpenChange={(open) => !open && setConfirmBulk(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmBulk === 'delete_duplicates'
                ? `Delete duplicates from ${selectedIds.size} clusters?`
                : `Archive duplicates from ${selectedIds.size} clusters?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmBulk === 'delete_duplicates'
                ? 'This will permanently delete all non-representative images from the selected clusters. This cannot be undone.'
                : 'Non-representative images in the selected clusters will be archived and hidden from the datalake.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmBulk === 'delete_duplicates'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
              onClick={() => {
                if (confirmBulk) {
                  handleBulkAction(confirmBulk);
                  setConfirmBulk(null);
                }
              }}
            >
              {confirmBulk === 'delete_duplicates' ? 'Delete' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
