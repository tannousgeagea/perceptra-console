// Turns the overview response into the stations on the rail and the
// "Needs attention" list. Pure functions: the page only renders what this returns.
import type { ProjectOverview } from '@/types/overview';
import type { ProjectPermission } from '@/types/permissions';

export type StageState = 'done' | 'waiting' | 'attention' | 'idle' | 'running';

export const STATE_LABEL: Record<StageState, string> = {
  done: 'Up to date',
  waiting: 'Waiting',
  attention: 'Needs attention',
  idle: 'Not started',
  running: 'Running',
};

export interface StageAction {
  label: string;
  to: string;
  /** Without this permission the action is shown as a plain "view" link. */
  needs?: ProjectPermission;
  viewLabel?: string;
  /** Where the "view" link goes when it differs from `to`. */
  viewTo?: string;
}

export interface Stage {
  key: string;
  name: string;
  state: StageState;
  value: string;
  unit: string;
  detail: string[];
  action: StageAction;
}

export interface AttentionItem {
  key: string;
  level: 'attention' | 'waiting' | 'idle';
  text: string;
  action: StageAction;
}

const n = (value: number) => value.toLocaleString();
const plural = (count: number, word: string, many = `${word}s`) => `${n(count)} ${count === 1 ? word : many}`;
const pct = (value: number | null | undefined) =>
  value == null ? '—' : value <= 1 ? value.toFixed(2) : value.toFixed(1);
const signed = (value: number) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(2)}`;

/** The candidate against its model's production version, or the candidate's own page when nothing of that model is in production. */
function compareTo(o: ProjectOverview, base: string): string | null {
  const c = o.models.candidate;
  if (!c) return null;
  const prod = o.deployment.production.find((p) => p.model_id === c.model_id && p.version_id !== c.version_id);
  const model = `${base}/models/${c.model_id}`;
  return prod
    ? `${model}/compare?a=${encodeURIComponent(prod.version_id)}&b=${encodeURIComponent(c.version_id)}`
    : `${model}/versions/${encodeURIComponent(c.version_id)}`;
}

/** "12 min", "2 h 5 min". */
function minutes(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function eta(seconds: number | null): string | null {
  if (seconds == null) return null;
  if (seconds < 90) return 'under 2 min left';
  const minutes = Math.round(seconds / 60);
  return minutes < 90 ? `about ${minutes} min left` : `about ${Math.round(minutes / 60)} h left`;
}

export function buildStages(o: ProjectOverview, base: string): Stage[] {
  const { data, annotation, review, dataset, training, models, deployment, monitoring, fleet } = o;
  const rollout = fleet.rollout;
  const hasImages = data.total_images > 0;
  const production = deployment.production[0];
  const latestRun = training.latest;
  const candidate = models.candidate;

  const stalled = latestRun?.stalled_seconds != null;
  const trainState: StageState = stalled
    ? 'attention'
    : training.running > 0
    ? 'running'
    : latestRun?.status === 'failed' ? 'attention'
    // A stopped run produced nothing: not "up to date", a new run is due.
    : latestRun?.status === 'cancelled' ? 'waiting'
    : latestRun ? 'done' : 'idle';
  const stopped = trainState === 'waiting';

  const neverMeasured = !!production && !monitoring.last_snapshot_at;

  return [
    {
      key: 'data',
      name: 'Data',
      state: hasImages ? 'done' : 'idle',
      value: n(data.total_images),
      unit: data.total_images === 1 ? 'image' : 'images',
      detail: [hasImages ? (data.added_7d ? `+${n(data.added_7d)} in the last 7 days` : 'Nothing new this week') : 'Add images to begin'],
      action: { label: 'Upload data', to: `${base}/upload`, needs: 'write', viewLabel: 'Browse images', viewTo: `${base}/dataset` },
    },
    {
      key: 'annotate',
      name: 'Annotate',
      state: !hasImages ? 'idle' : annotation.unannotated > 0 ? 'waiting' : 'done',
      value: n(annotation.unannotated),
      unit: 'unannotated',
      detail: [
        plural(annotation.open_jobs, 'open job'),
        ...(annotation.in_progress ? [`${n(annotation.in_progress)} in progress`] : []),
      ],
      action: annotation.unannotated_without_job > 0
        ? { label: 'Create job', to: `${base}/annotate`, needs: 'manage', viewLabel: 'Open jobs' }
        : { label: 'Open jobs', to: `${base}/annotate` },
    },
    {
      key: 'review',
      name: 'Review',
      state: review.to_review > 0 ? 'waiting' : review.reviewed > 0 ? 'done' : 'idle',
      value: n(review.to_review),
      unit: 'to review',
      detail: [
        `${n(review.reviewed)} reviewed`,
        ...(review.rejected ? [`${n(review.rejected)} sent back`] : []),
      ],
      action: { label: 'Review', to: `${base}/dataset?q=status:annotated`, needs: 'review', viewLabel: 'View images' },
    },
    {
      key: 'dataset',
      name: 'Dataset',
      state: dataset.reviewed_not_in_version > 0 ? 'waiting' : dataset.latest ? 'done' : 'idle',
      value: dataset.latest ? `v${dataset.latest.version_number}` : '—',
      unit: dataset.latest ? `${n(dataset.latest.total_images)} images` : 'no versions',
      detail: [dataset.reviewed_not_in_version
        ? `${n(dataset.reviewed_not_in_version)} reviewed images not in a version`
        : dataset.latest ? 'Every reviewed image is versioned' : 'Versions freeze data for training'],
      action: { label: 'New version', to: `${base}/versions`, needs: 'edit', viewLabel: 'View versions' },
    },
    {
      key: 'train',
      name: 'Train',
      state: trainState,
      value: !latestRun ? '—'
        : stalled ? 'Stalled'
        : trainState === 'running' ? `${Math.round(latestRun.progress)}%`
        : latestRun.status === 'failed' ? 'Failed'
        : stopped ? 'Stopped' : latestRun.version_name,
      unit: !latestRun ? 'no runs yet'
        : trainState === 'running' || stalled ? `epoch ${latestRun.current_epoch} of ${latestRun.total_epochs}`
        : latestRun.status === 'failed' || stopped ? latestRun.version_name : latestRun.model_name,
      detail: !latestRun ? ['Train a model on a dataset version'] : [
        stalled ? `No new epoch for ${minutes(latestRun.stalled_seconds!)}`
          : trainState === 'running' ? (eta(latestRun.eta_seconds) ?? latestRun.model_name)
          : stopped ? `Stopped at epoch ${latestRun.current_epoch} of ${latestRun.total_epochs}`
          : `Last run ${latestRun.status}`,
        ...(training.running > 1 ? [`${n(training.running)} runs active`] : []),
      ],
      action: latestRun
        ? { label: trainState === 'running' || stalled ? 'Watch run' : 'Open run', to: `${base}/sessions/${latestRun.id}` }
        : { label: 'Train a model', to: `${base}/models`, needs: 'edit', viewLabel: 'View models' },
    },
    {
      key: 'evaluate',
      name: 'Evaluate',
      state: candidate?.delta != null && candidate.delta > 0 ? 'waiting' : models.trained_versions ? 'done' : 'idle',
      value: candidate?.metric_value != null ? pct(candidate.metric_value)
        : production?.metric_value != null ? pct(production.metric_value) : '—',
      unit: (candidate?.metric_name ?? production?.metric_name) || 'no trained versions',
      detail: candidate?.delta != null
        ? [`${candidate.version_name} ${signed(candidate.delta)} vs ${candidate.production_version_name}`]
        : candidate ? [`${candidate.version_name} is ready to deploy`]
        : [models.trained_versions ? plural(models.trained_versions, 'trained version') : 'Metrics appear after training'],
      action: candidate
        ? { label: 'Compare', to: compareTo(o, base)! }
        : { label: 'Evaluation', to: `${base}/evaluation` },
    },
    {
      key: 'deploy',
      name: 'Deploy',
      state: fleet.paused_rollouts > 0 ? 'attention'
        : rollout ? 'running'
        : production ? (candidate?.delta != null && candidate.delta > 0 ? 'waiting' : 'done') : candidate ? 'waiting' : 'idle',
      value: production ? production.version_name : '—',
      unit: production ? `${production.model_name} in production` : 'nothing in production',
      detail: [
        deployment.staging.length
          ? `Staging: ${deployment.staging.map((v) => v.version_name).join(', ')}`
          : production ? 'Nothing in staging' : 'Deploy a trained version',
        ...(rollout
          ? [`${rollout.status === 'paused' ? 'Paused: ' : ''}${rollout.version_name} on ${rollout.progress.updated} of ${plural(rollout.progress.total, 'device')}`]
          : fleet.devices
            ? [`${n(fleet.in_sync)} of ${plural(fleet.devices, 'edge device')} up to date`]
            : []),
      ],
      action: rollout
        ? { label: rollout.status === 'paused' ? 'Open rollout' : 'Watch rollout', to: `${base}/rollouts/${rollout.rollout_id}` }
        : candidate
          ? { label: `Promote ${candidate.version_name}`, to: `${base}/models/${candidate.model_id}?tab=deployment`, needs: 'manage', viewLabel: 'View deployment' }
          : production
            ? { label: 'View deployment', to: `${base}/models/${production.model_id}?tab=deployment` }
            : { label: 'Models', to: `${base}/models` },
    },
    {
      key: 'monitor',
      name: 'Monitor',
      state: monitoring.open_alerts > 0 || neverMeasured ? 'attention' : production ? 'done' : 'idle',
      value: n(monitoring.open_alerts),
      unit: monitoring.open_alerts === 1 ? 'open alert' : 'open alerts',
      detail: [
        monitoring.last_snapshot_at ? `Checked ${ago(monitoring.last_snapshot_at)}`
          : production ? 'Metrics never checked' : 'Starts with a production model',
        ...(monitoring.active_retraining_policies ? [plural(monitoring.active_retraining_policies, 'retraining policy', 'retraining policies')] : []),
      ],
      action: { label: 'Alerts', to: `${base}/evaluation?tab=alerts` },
    },
  ];
}

export function buildAttention(o: ProjectOverview, base: string): AttentionItem[] {
  const items: AttentionItem[] = [];
  const { monitoring, training, models, dataset, review, annotation, data, deployment } = o;
  const alert = monitoring.top_alert;

  if (alert) {
    const more = monitoring.open_alerts > 1 ? ` (+${n(monitoring.open_alerts - 1)} more)` : '';
    items.push({
      key: 'alert',
      level: 'attention',
      text: `${alert.message || `${alert.metric_name} crossed its threshold`}${more}`,
      action: { label: 'Alerts', to: `${base}/evaluation?tab=alerts` },
    });
  }
  if (training.latest?.status === 'failed' && training.running === 0) {
    items.push({
      key: 'failed-run',
      level: 'attention',
      text: `Training ${training.latest.model_name} ${training.latest.version_name} failed${training.latest.error ? `: ${training.latest.error}` : ''}`,
      action: { label: 'Open run', to: `${base}/sessions/${training.latest.id}` },
    });
  }
  if (training.latest?.stalled_seconds != null) {
    items.push({
      key: 'stalled-run',
      level: 'attention',
      text: `Training ${training.latest.model_name} ${training.latest.version_name} has had no new epoch for ${minutes(training.latest.stalled_seconds)}; it may be stuck`,
      action: { label: 'Check run', to: `${base}/sessions/${training.latest.id}` },
    });
  }
  const rollout = o.fleet.rollout;
  if (rollout?.status === 'paused') {
    items.push({
      key: 'paused-rollout',
      level: 'attention',
      // The reason itself starts with "Paused:"; don't say it twice.
      text: `Rollout of ${rollout.model_name} ${rollout.version_name} to devices is paused${rollout.status_reason ? `. ${rollout.status_reason.replace(/^Paused:\s*/i, '')}` : ''}`,
      action: { label: 'Open rollout', to: `${base}/rollouts/${rollout.rollout_id}` },
    });
  }
  const behind = o.fleet.devices - o.fleet.in_sync;
  if (!rollout && behind > 0) {
    items.push({
      key: 'devices-behind',
      level: 'waiting',
      text: `${plural(behind, 'edge device')} ${behind === 1 ? "doesn't" : "don't"} run the version asked of ${behind === 1 ? 'it' : 'them'} yet`,
      action: { label: 'Open Fleet', to: '/fleet' },
    });
  }
  if (deployment.production.length && !monitoring.last_snapshot_at) {
    items.push({
      key: 'no-metrics',
      level: 'attention',
      text: 'A model is in production but its metrics have never been measured, so alerts can\'t fire',
      action: { label: 'Evaluation', to: `${base}/evaluation` },
    });
  }
  const c = models.candidate;
  if (c?.delta != null && c.delta > 0) {
    items.push({
      key: 'candidate',
      level: 'waiting',
      text: `${c.model_name} ${c.version_name} beats production ${c.production_version_name} on ${c.metric_name} (${signed(c.delta)})`,
      action: { label: `Promote ${c.version_name}`, to: `${base}/models/${c.model_id}?tab=deployment`, needs: 'manage', viewLabel: 'Compare', viewTo: compareTo(o, base)! },
    });
  } else if (c && !deployment.production.length) {
    items.push({
      key: 'candidate',
      level: 'waiting',
      text: `${c.model_name} ${c.version_name} is trained and nothing runs in production yet`,
      action: { label: 'Deploy', to: `${base}/models/${c.model_id}?tab=deployment`, needs: 'manage', viewLabel: 'View model' },
    });
  }
  if (dataset.reviewed_not_in_version > 0) {
    items.push({
      key: 'version',
      level: 'waiting',
      text: `${plural(dataset.reviewed_not_in_version, 'reviewed image')} ${dataset.reviewed_not_in_version === 1 ? "isn't" : "aren't"} in any dataset version yet`,
      action: { label: 'New version', to: `${base}/versions`, needs: 'edit', viewLabel: 'View versions' },
    });
  }
  if (review.to_review > 0) {
    items.push({
      key: 'review',
      level: 'waiting',
      text: `${plural(review.to_review, 'annotated image')} ${review.to_review === 1 ? 'waits' : 'wait'} for review`,
      action: { label: 'Review', to: `${base}/dataset?q=status:annotated`, needs: 'review', viewLabel: 'View images' },
    });
  }
  if (annotation.unannotated_without_job > 0) {
    items.push({
      key: 'no-job',
      level: 'waiting',
      text: `${plural(annotation.unannotated_without_job, 'unannotated image')} ${annotation.unannotated_without_job === 1 ? "isn't" : "aren't"} in any job`,
      action: { label: 'Create job', to: `${base}/annotate`, needs: 'manage', viewLabel: 'Open jobs' },
    });
  }
  if (data.total_images === 0) {
    items.push({
      key: 'empty',
      level: 'idle',
      text: 'This project has no images yet. Upload files or link them from storage to start the pipeline',
      action: { label: 'Upload data', to: `${base}/upload`, needs: 'write', viewLabel: 'Browse images', viewTo: `${base}/dataset` },
    });
  }
  return items;
}

/** One sentence: what runs, what's wrong, what's waiting. */
export function healthSentence(o: ProjectOverview): string {
  const parts: string[] = [];
  const production = o.deployment.production[0];
  parts.push(production ? `${production.model_name} ${production.version_name} runs in production` : 'Nothing in production yet');
  if (o.monitoring.open_alerts) parts.push(plural(o.monitoring.open_alerts, 'open alert'));
  if (o.training.running) parts.push(`${plural(o.training.running, 'training run')} active`);
  if (o.annotation.unannotated) parts.push(`${n(o.annotation.unannotated)} images wait for annotation`);
  return parts.join(', ') + '.';
}

export function ago(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}
