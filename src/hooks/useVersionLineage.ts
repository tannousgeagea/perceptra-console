// hooks/useVersionLineage.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import type { VersionComparison, VersionLineage } from '@/types/lineage';

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${res.status})`);
  }
  return res.json();
}

/** One version: where it came from (dataset, parent, run) and where it went (deployments). */
export const useVersionLineage = (modelId?: string, versionId?: string) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['version-lineage', orgId, modelId, versionId],
    queryFn: () =>
      getJson<VersionLineage>(
        `/api/v1/models/${modelId}/versions/${encodeURIComponent(versionId!)}/lineage`,
      ),
    enabled: !!orgId && !!modelId && !!versionId,
  });
};

/** What changed from version a to version b: metrics, data, settings. */
export const useVersionComparison = (modelId?: string, a?: string | null, b?: string | null) => {
  const orgId = useAuth().getCurrentOrganization()?.id;
  return useQuery({
    queryKey: ['version-compare', orgId, modelId, a, b],
    queryFn: () =>
      getJson<VersionComparison>(
        `/api/v1/models/${modelId}/compare?a=${encodeURIComponent(a!)}&b=${encodeURIComponent(b!)}`,
      ),
    enabled: !!orgId && !!modelId && !!a && !!b,
  });
};
