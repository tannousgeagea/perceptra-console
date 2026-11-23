// Edge fleet: sites, devices, cameras and model rollouts (/api/v1/fleet/*).

export type DeviceStatus = 'online' | 'stale' | 'offline' | 'pending' | 'revoked';
export type ReportedStatus = 'pending' | 'downloading' | 'running' | 'failed' | 'rolled_back';
export type RolloutStatus = 'preparing' | 'canary' | 'rolling' | 'paused' | 'completed' | 'superseded' | 'failed';
export type TargetState = 'waiting' | 'assigned' | 'updated' | 'failed' | 'skipped';

export interface FleetVersionRef {
  version_id: string;
  version_name: string | null;
  version_number: number;
}

export interface SiteCounts {
  total: number;
  online: number;
  stale: number;
  offline: number;
  pending: number;
  revoked: number;
}

export interface Site {
  site_id: string;
  name: string;
  location: string;
  timezone: string;
  created_at: string;
  devices?: SiteCounts;
}

/** One model on one device: what it should run against what it reports. */
export interface DeviceModel {
  model_id: string;
  model_name: string;
  project_id: string;
  desired: FleetVersionRef | null;
  reported: FleetVersionRef | null;
  reported_status: ReportedStatus;
  reported_error: string | null;
  reported_at: string | null;
  in_sync: boolean;
  rollout_id: string | null;
}

/** Health numbers: the agent sends system ones, the inference service its own (fps, latency…). */
export type HealthMetrics = Record<string, number | string | null>;

export interface Device {
  device_id: string;
  name: string;
  labels: string[];
  site: { site_id: string; name: string } | null;
  status: DeviceStatus;
  last_seen_at: string | null;
  enrolled_at: string | null;
  agent_version: string | null;
  enrollment_pending: boolean;
  enrollment_expires_at: string | null;
  health: HealthMetrics;
  models: DeviceModel[];
  camera_count: number;
}

export interface Camera {
  camera_id: string;
  name: string;
  position: string;
  order: number;
  settings: Record<string, unknown>;
}

export interface DeviceRolloutEntry {
  rollout_id: string;
  model_name: string;
  project_id: string;
  /** The version this device was asked to run. */
  version: FleetVersionRef | null;
  from_version: FleetVersionRef | null;
  is_rollback: boolean;
  rollout_status: RolloutStatus;
  state: TargetState;
  error: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface DeviceDetail extends Device {
  hardware: Record<string, unknown>;
  accepts: string[];
  last_ip: string | null;
  protocol: number | null;
  poll_seconds: number;
  revoked_at: string | null;
  created_at: string;
  cameras: Camera[];
  rollouts: DeviceRolloutEntry[];
}

export interface Enrollment {
  code: string;
  expires_at: string;
}

export interface HealthPoint {
  at: string;
  [metric: string]: number | string | null;
}

export interface RolloutProgress {
  total: number;
  updated: number;
  failed: number;
  assigned: number;
  waiting: number;
  skipped: number;
  /** Open targets whose device is offline or stale. */
  offline: number;
}

export interface RolloutTarget {
  device_id: string;
  device_name: string;
  site: string | null;
  device_status: DeviceStatus;
  phase: 'canary' | 'main';
  state: TargetState;
  error: string | null;
  assigned_at: string | null;
  finished_at: string | null;
  /** What this device ran when the rollout asked it to update; a rollback sends it back there. */
  from_version: FleetVersionRef | null;
  /** What this device was asked to run (rollbacks send devices to different versions). */
  version: FleetVersionRef | null;
}

export interface Rollout {
  rollout_id: string;
  status: RolloutStatus;
  status_reason: string | null;
  model_id: string;
  model_name: string;
  project_id: string;
  version: FleetVersionRef | null;
  previous_version: FleetVersionRef | null;
  is_rollback: boolean;
  strategy: 'all' | 'canary';
  canary_count: number;
  canary_minutes: number;
  max_failures: number;
  selector: { device_ids?: string[]; site_ids?: string[]; labels?: string[]; running_model?: boolean };
  created_by: string | null;
  created_at: string;
  canary_healthy_since: string | null;
  completed_at: string | null;
  progress: RolloutProgress;
  targets?: RolloutTarget[];
}

export interface RolloutCreate {
  model_id: string;
  version_id: string;
  device_ids: string[];
  site_ids: string[];
  labels: string[];
  running_model: boolean;
  strategy: 'all' | 'canary';
  canary_count: number;
  canary_minutes: number;
  max_failures: number;
}

/** In the project overview: the edge devices running the project's models. */
export interface ProjectFleet {
  devices: number;
  in_sync: number;
  unreachable: number;
  active_rollouts: number;
  paused_rollouts: number;
  rollout: {
    rollout_id: string;
    status: RolloutStatus;
    status_reason: string | null;
    is_rollback: boolean;
    model_id: string;
    model_name: string;
    version_name: string;
    progress: RolloutProgress;
  } | null;
}

/** In the organization home: devices by status, revoked ones left out. */
export interface FleetCounts {
  total: number;
  online: number;
  stale: number;
  offline: number;
  pending: number;
}
