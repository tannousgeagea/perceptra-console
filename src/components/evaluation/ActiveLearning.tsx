// Active learning: unreviewed images with model predictions, ranked by how much
// a human look would help, and turned into a review job in one step.
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ImageIcon, Loader2, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Badge } from "@/components/ui/ui/badge";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Input } from "@/components/ui/ui/input";
import { Label } from "@/components/ui/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectPermissions } from "@/hooks/usePermissions";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { useCreateJobFromImages } from "@/hooks/useMonitoringLoop";
import type { PriorityImage, PriorityScores, SamplingStrategy } from "@/types/evaluation";

interface ActiveLearningProps {
  priorityImages: PriorityImage[];
  isLoading: boolean;
  onGenerateQueue: (strategy: SamplingStrategy, batchSize: number) => void;
}

const STRATEGIES: Record<SamplingStrategy, { label: string; description: string }> = {
  hybrid: {
    label: "Balanced",
    description: "Weighs low confidence, rare classes, past mistakes and crowded images together.",
  },
  uncertainty: {
    label: "Low confidence",
    description: "Images where the model's least sure prediction has the lowest confidence.",
  },
  diversity: {
    label: "Rare classes",
    description: "Images showing classes that are rare among reviewed annotations.",
  },
  "error-prone": {
    label: "Past mistakes",
    description: "Images showing classes the model often got wrong in earlier reviews.",
  },
};

const SIGNALS: { key: keyof PriorityScores; label: string }[] = [
  { key: "uncertainty", label: "Uncertain" },
  { key: "rarity", label: "Rare" },
  { key: "error_prone", label: "Error-prone" },
  { key: "density", label: "Crowded" },
];

const ALL_MEMBERS = "__none__";

export const ActiveLearning = ({ priorityImages, isLoading, onGenerateQueue }: ActiveLearningProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const orgId = useAuth().getCurrentOrganization()?.id;
  const permissions = useProjectPermissions(projectId);
  const canCreateJob = !permissions.isLoading && permissions.can("manage");

  const [strategy, setStrategy] = useState<SamplingStrategy>("hybrid");
  const [batchSize, setBatchSize] = useState(20);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Images already in an open job can't go into another one.
  const ids = useMemo(
    () => priorityImages.filter((i) => !i.in_open_job).map((i) => i.project_image_id),
    [priorityImages],
  );
  const chosen = ids.filter((id) => selected.has(id));
  const allChosen = ids.length > 0 && chosen.length === ids.length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Images worth reviewing next</CardTitle>
          <CardDescription>
            Unreviewed images with model predictions, ranked by how much a human look would help.
            Pick the ones to review and turn them into a job.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="al-strategy" className="text-xs text-muted-foreground">Rank by</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as SamplingStrategy)}>
                <SelectTrigger id="al-strategy" className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STRATEGIES).map(([key, s]) => (
                    <SelectItem key={key} value={key}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="al-size" className="text-xs text-muted-foreground">Show</Label>
              <Select value={String(batchSize)} onValueChange={(v) => setBatchSize(parseInt(v))}>
                <SelectTrigger id="al-size" className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100, 200].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setSelected(new Set());
                onGenerateQueue(strategy, batchSize);
              }}
              disabled={isLoading}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "motion-safe:animate-spin")} />
              Rank images
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{STRATEGIES[strategy].description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              {priorityImages.length
                ? `${priorityImages.length} images, highest priority first`
                : "Nothing ranked yet"}
            </CardDescription>
          </div>
          {canCreateJob && priorityImages.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={allChosen}
                  onCheckedChange={(v) => setSelected(v ? new Set(ids) : new Set())}
                  aria-label="Select all images"
                />
                Select all
              </label>
              <Button onClick={() => setDialogOpen(true)} disabled={chosen.length === 0}>
                <Users className="mr-2 h-4 w-4" />
                Create review job{chosen.length ? ` (${chosen.length})` : ""}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {priorityImages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ImageIcon className="mx-auto mb-4 h-10 w-10 opacity-50" aria-hidden />
              <p>No unreviewed images with model predictions.</p>
              <p className="mt-1 text-sm">
                Run Auto Annotate or ingest predictions, then rank them here.
              </p>
            </div>
          ) : (
            <ul className="divide-y rounded-lg border">
              {priorityImages.map((image) => {
                const isChosen = selected.has(image.project_image_id);
                return (
                  <li
                    key={image.project_image_id}
                    className={cn("flex items-center gap-4 p-3", isChosen && "bg-[var(--mtx-primary)]/5")}
                  >
                    {canCreateJob && (
                      <Checkbox
                        checked={isChosen}
                        onCheckedChange={() => toggle(image.project_image_id)}
                        disabled={!!image.in_open_job}
                        aria-label={
                          image.in_open_job
                            ? `${image.image_name} is already in job ${image.in_open_job}`
                            : `Select ${image.image_name}`
                        }
                      />
                    )}
                    <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                      {image.priority_rank}
                    </span>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {image.thumbnail_url ? (
                        <img src={image.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="m-4 h-6 w-6 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/projects/${projectId}/images/${image.image_id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {image.image_name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {image.in_open_job && (
                          <Badge variant="outline" className="text-xs font-normal">In job: {image.in_open_job}</Badge>
                        )}
                        {image.reasons.map((reason) => (
                          <Badge key={reason} variant="secondary" className="text-xs font-normal">{reason}</Badge>
                        ))}
                      </div>
                    </div>
                    {image.scores && (
                      <dl className="hidden shrink-0 grid-cols-4 gap-3 text-center lg:grid">
                        {SIGNALS.map(({ key, label }) => (
                          <div key={key} className="w-16">
                            <dt className="text-[11px] text-muted-foreground">{label}</dt>
                            <dd className="mt-1">
                              <span className="block h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                                <span
                                  className="block h-full rounded-full bg-[var(--mtx-primary)]"
                                  style={{ width: `${Math.round(image.scores![key] * 100)}%` }}
                                />
                              </span>
                              <span className="sr-only">{Math.round(image.scores![key] * 100)}%</span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="w-14 shrink-0 text-right">
                      <div className="text-[11px] text-muted-foreground">Priority</div>
                      <div className="text-sm font-semibold tabular-nums">{image.priority_score.toFixed(2)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {!canCreateJob && priorityImages.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">Project managers can turn these images into a review job.</p>
          )}
        </CardContent>
      </Card>

      {dialogOpen && (
        <CreateJobDialog
          projectId={projectId}
          orgId={orgId}
          imageIds={chosen}
          strategyLabel={STRATEGIES[strategy].label}
          onClose={() => setDialogOpen(false)}
          onCreated={() => {
            setSelected(new Set());
            setDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};

/** Name a new review job for the chosen project images (also used for field samples). */
export function CreateJobDialog({
  projectId,
  orgId,
  imageIds,
  strategyLabel,
  onClose,
  onCreated,
}: {
  projectId?: string;
  orgId?: string;
  imageIds: number[];
  strategyLabel: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const [name, setName] = useState(`Review: ${strategyLabel.toLowerCase()}, ${today}`);
  const [assignee, setAssignee] = useState(ALL_MEMBERS);
  const members = useProjectMembers(orgId, projectId);
  const createJob = useCreateJobFromImages(projectId);
  const navigate = useNavigate();

  const submit = () =>
    createJob.mutate(
      {
        name: name.trim(),
        project_image_ids: imageIds,
        ...(assignee !== ALL_MEMBERS ? { assignee_id: Number(assignee) } : {}),
      },
      {
        onSuccess: (job) => {
          const skipped = job.skipped_in_open_job.length;
          toast.success(`Created "${job.name}" with ${job.image_count} images`, {
            description: skipped ? `${skipped} already in an open job were left there.` : undefined,
            action: { label: "Open jobs", onClick: () => navigate(`/projects/${projectId}/annotate`) },
          });
          onCreated();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the job"),
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create review job</DialogTitle>
          <DialogDescription>
            {imageIds.length} selected {imageIds.length === 1 ? "image goes" : "images go"} into a new job.
            Images already in an open job stay where they are.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="job-name">Job name</Label>
            <Input id="job-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="job-assignee">Assign to</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger id="job-assignee"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_MEMBERS}>Nobody yet</SelectItem>
                {(members.data ?? []).map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createJob.isPending}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || createJob.isPending}>
              {createJob.isPending && <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />}
              Create job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
