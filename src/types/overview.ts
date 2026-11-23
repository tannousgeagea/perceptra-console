// GET /api/v1/projects/{id}/overview: one project's pipeline, stage by stage.
import type { FleetCounts, ProjectFleet } from './fleet';

export interface VersionRef {
  model_id: string;
  model_name: string;
  version_id: string;
  version_number: number;
  version_name: string;
}

export interface DeployedVersion extends VersionRef {
  deployed_at: string | null;
  metric_name: string | null;
  metric_value: number | null;
}

export interface ProjectOverview {
  /** last_activity_at: only in the organization home. */
  project: { project_id: string; name: string; last_activity_at?: string | null };
  generated_at: string;
  data: { total_images: number; added_7d: number; last_added_at: string | null };
  annotation: {
    unannotated: number;
    /** Unannotated and not in any job yet. */
    unannotated_without_job: number;
    in_progress: number;
    marked_empty: number;
    open_jobs: number;
    jobs_by_status: Record<string, number>;
  };
  review: { to_review: number; rejected: number; reviewed: number };
  dataset: {
    versions: number;
    latest: {
      version_id: string;
      version_name: string;
      version_number: number;
      total_images: number;
      export_status: string;
      created_at: string;
    } | null;
    reviewed_not_in_version: number;
  };
  training: {
    running: number;
    latest: (VersionRef & {
      /** Numeric id: what /projects/:id/sessions/:sessionId and the API use. */
      id: number;
      session_id: string;
      status: string;
      progress: number;
      current_epoch: number;
      total_epochs: number;
      eta_seconds: number | null;
      /** Running but no epoch for unusually long. */
      stalled_seconds?: number | null;
      created_at: string;
      started_at: string | null;
      completed_at: string | null;
      error: string | null;
    }) | null;
  };
  models: {
    count: number;
    trained_versions: number;
    /** The newest trained version worth deploying: better than production, or nothing is in production yet. */
    candidate: (VersionRef & {
      metric_name: string | null;
      metric_value: number | null;
      production_version_name: string | null;
      production_metric_value: number | null;
      delta: number | null;
    }) | null;
  };
  deployment: { production: DeployedVersion[]; staging: DeployedVersion[] };
  /** Edge devices that run this project's models. */
  fleet: ProjectFleet;
  monitoring: {
    open_alerts: number;
    alerts_by_severity: Record<string, number>;
    top_alert: {
      severity: 'critical' | 'warning' | 'info';
      metric_name: string;
      message: string;
      current_value: number;
      threshold_value: number | null;
      alert_date: string;
    } | null;
    /** When metrics were last measured; null = never. */
    last_snapshot_at: string | null;
    active_retraining_policies: number;
  };
}

// GET /api/v1/organizations/home: every project the caller can open.
export interface RunningSession {
  id: number;
  status: string;
  progress: number;
  current_epoch: number;
  total_epochs: number;
  eta_seconds: number | null;
  model_id: string;
  model_name: string;
  version_name: string;
  project_id: string;
  project_name: string;
}

export interface OrganizationHome {
  organization: { org_id: string; name: string };
  generated_at: string;
  /** All projects the caller can open; `projects` holds the most recently active `project_limit`. */
  project_count: number;
  project_limit: number;
  projects: ProjectOverview[];
  running: RunningSession[];
  production: (DeployedVersion & { project_id: string; project_name: string })[];
  fleet: FleetCounts;
}
