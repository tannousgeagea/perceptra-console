// hooks/useFleet.ts — edge devices, sites, cameras and rollouts.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch, withQuery, type QueryParams } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Camera,
  Device,
  DeviceDetail,
  DeviceStatus,
  Enrollment,
  HealthPoint,
  Rollout,
  RolloutCreate,
  Site,
} from '@/types/fleet';

const ACTIVE_ROLLOUT = new Set(['preparing', 'canary', 'rolling', 'paused']);
export const isActiveRollout = (r: Pick<Rollout, 'status'>) => ACTIVE_ROLLOUT.has(r.status);

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI validation errors come as a list.
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const send = <T,>(path: string, method: string, body?: unknown) =>
  call<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

const useOrgId = () => useAuth().getCurrentOrganization()?.id;

/** Refresh everything fleet-related (lists, a device, rollouts, overviews). */
function useInvalidateFleet() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['fleet'] });
    qc.invalidateQueries({ queryKey: ['project-overview'] });
    qc.invalidateQueries({ queryKey: ['organization-home'] });
  };
}

const fail = (err: Error) => toast.error(err.message);

// ── Reading ──────────────────────────────────────────────────────────────────

export interface DeviceFilters {
  site_id?: string;
  status?: DeviceStatus;
  model_id?: string;
  label?: string;
  q?: string;
}

export const useSites = () => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'sites', orgId],
    queryFn: () => call<Site[]>('/api/v1/fleet/sites'),
    enabled: !!orgId,
  });
};

/** Every device; refreshes every 30 s so statuses stay current. */
export const useDevices = (filters: DeviceFilters = {}) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'devices', orgId, filters],
    queryFn: () => call<Device[]>(withQuery('/api/v1/fleet/devices', filters as QueryParams)),
    enabled: !!orgId,
    refetchInterval: 30_000,
  });
};

export const useDevice = (deviceId?: string) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'device', orgId, deviceId],
    queryFn: () => call<DeviceDetail>(`/api/v1/fleet/devices/${deviceId}`),
    enabled: !!orgId && !!deviceId,
    refetchInterval: 15_000,
    retry: false,
  });
};

export const useDeviceHealth = (deviceId: string | undefined, hours: number) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'health', orgId, deviceId, hours],
    queryFn: () => call<HealthPoint[]>(withQuery(`/api/v1/fleet/devices/${deviceId}/health`, { hours })),
    enabled: !!orgId && !!deviceId,
    refetchInterval: 60_000,
  });
};

export interface RolloutFilters {
  model_id?: string;
  project_id?: string;
  active?: boolean;
  limit?: number;
}

/** Rollouts the caller may see; refresh every 10 s while any is in progress. */
export const useRollouts = (filters: RolloutFilters = {}, enabled = true) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'rollouts', orgId, filters],
    queryFn: () => call<Rollout[]>(withQuery('/api/v1/fleet/rollouts', filters as QueryParams)),
    enabled: !!orgId && enabled,
    refetchInterval: (query) => (query.state.data?.some(isActiveRollout) ? 10_000 : false),
  });
};

export const useRollout = (rolloutId?: string) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'rollout', orgId, rolloutId],
    queryFn: () => call<Rollout>(`/api/v1/fleet/rollouts/${rolloutId}`),
    enabled: !!orgId && !!rolloutId,
    refetchInterval: (query) => (query.state.data && isActiveRollout(query.state.data) ? 10_000 : false),
    retry: false,
  });
};

/** Devices that run or should run one model. */
export const useModelDevices = (modelId?: string) => {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ['fleet', 'model-devices', orgId, modelId],
    queryFn: () => call<Device[]>(`/api/v1/fleet/models/${modelId}/devices`),
    enabled: !!orgId && !!modelId,
    refetchInterval: 30_000,
  });
};

// ── Sites ────────────────────────────────────────────────────────────────────

export interface SiteInput {
  name: string;
  location?: string;
  timezone?: string;
}

export const useSaveSite = () => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: ({ siteId, data }: { siteId?: string; data: SiteInput }) =>
      siteId ? send<Site>(`/api/v1/fleet/sites/${siteId}`, 'PATCH', data) : send<Site>('/api/v1/fleet/sites', 'POST', data),
    onSuccess: (_, { siteId }) => {
      invalidate();
      toast.success(siteId ? 'Site saved' : 'Site added');
    },
    onError: fail,
  });
};

export const useDeleteSite = () => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (siteId: string) => send<void>(`/api/v1/fleet/sites/${siteId}`, 'DELETE'),
    onSuccess: () => {
      invalidate();
      toast.success('Site deleted');
    },
    onError: fail,
  });
};

// ── Devices ──────────────────────────────────────────────────────────────────

export interface DeviceInput {
  name: string;
  site_id?: string | null;
  labels?: string[];
}

export const useAddDevice = () => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (data: DeviceInput) =>
      send<{ device: Device; enrollment: Enrollment }>('/api/v1/fleet/devices', 'POST', data),
    onSuccess: invalidate,
    onError: fail,
  });
};

export interface DevicePatch {
  name?: string;
  site_id?: string | null;
  clear_site?: boolean;
  labels?: string[];
}

export const useUpdateDevice = (deviceId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (data: DevicePatch) => send<DeviceDetail>(`/api/v1/fleet/devices/${deviceId}`, 'PATCH', data),
    onSuccess: () => {
      invalidate();
      toast.success('Device saved');
    },
    onError: fail,
  });
};

/** A new one-time code; replaces any earlier one. */
export const useNewEnrollmentCode = (deviceId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: () => send<{ enrollment: Enrollment }>(`/api/v1/fleet/devices/${deviceId}/enrollment-code`, 'POST'),
    onSuccess: invalidate,
    onError: fail,
  });
};

export const useRevokeDevice = (deviceId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: () => send<DeviceDetail>(`/api/v1/fleet/devices/${deviceId}/revoke`, 'POST'),
    onSuccess: () => {
      invalidate();
      toast.success('Device revoked. Its key no longer works.');
    },
    onError: fail,
  });
};

export const useDeleteDevice = (deviceId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: () => send<void>(`/api/v1/fleet/devices/${deviceId}`, 'DELETE'),
    onSuccess: () => {
      invalidate();
      toast.success('Device deleted');
    },
    onError: fail,
  });
};

// ── Cameras ──────────────────────────────────────────────────────────────────

export const useAddCamera = (deviceId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (data: { name: string; position?: string }) =>
      send<Camera>(`/api/v1/fleet/devices/${deviceId}/cameras`, 'POST', data),
    onSuccess: () => {
      invalidate();
      toast.success('Camera added');
    },
    onError: fail,
  });
};

export const useDeleteCamera = () => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (cameraId: string) => send<void>(`/api/v1/fleet/cameras/${cameraId}`, 'DELETE'),
    onSuccess: () => {
      invalidate();
      toast.success('Camera removed');
    },
    onError: fail,
  });
};

// ── Rollouts ─────────────────────────────────────────────────────────────────

export const useCreateRollout = () => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (data: RolloutCreate) => send<Rollout>('/api/v1/fleet/rollouts', 'POST', data),
    onSuccess: invalidate,
    onError: fail,
  });
};

/** Pause, resume or roll back; each answers with the rollout to show next. */
export const useRolloutAction = (rolloutId: string) => {
  const invalidate = useInvalidateFleet();
  return useMutation({
    mutationFn: (action: 'pause' | 'resume' | 'rollback') =>
      send<Rollout>(`/api/v1/fleet/rollouts/${rolloutId}/${action}`, 'POST'),
    onSuccess: (_, action) => {
      invalidate();
      toast.success(action === 'pause' ? 'Rollout paused' : action === 'resume' ? 'Rollout resumed' : 'Rollback started');
    },
    onError: fail,
  });
};
