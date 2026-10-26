// hooks/useRegisterFromStorage.ts
//
// "Register from storage": add images that already live in a connected storage
// profile (typically an external, read-only one) to the data lake / a project
// by reference — nothing is uploaded or copied. The hub reads only the image
// header to learn each image's size when it is not given.
//
//   GET  /api/v1/storage/profiles/{id}/browse   folder-style file picker (needs list permission)
//   POST /api/v1/ingest/images                  register (idempotent; ≤ 500 items per call)

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, withQuery } from '@/services/apiClient';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';

export const REGISTER_BATCH_SIZE = 500;

export interface BrowseFile {
  key: string;
  name: string;
  size: number;
  last_modified?: string | null;
  content_type?: string | null;
  registered: boolean;
  image_id?: string | null;
}

export interface BrowseResponse {
  storage_profile_id: string;
  prefix: string;
  folders: string[];
  files: BrowseFile[];
  next_token?: string | null;
}

export interface RegisterItem {
  storage_profile_id?: string;
  storage_profile_name?: string;
  storage_key: string;
  width?: number;
  height?: number;
  external_id?: string;
  name?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  annotations?: Record<string, unknown>[];
  [extra: string]: unknown;
}

/** Error of a failed request, with its HTTP status. */
export type HttpError = Error & { status?: number };

export interface RegisterItemResult {
  index: number;
  external_id?: string | null;
  status: 'created' | 'updated' | 'unchanged' | 'error';
  image_id?: string;
  project_image_id?: number;
  probed?: boolean;
  error?: string;
  storage_key?: string;
}

export interface RegisterSummary {
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  errors: number;
  results: RegisterItemResult[];
}

export interface RegisterOptions {
  projectId?: string;
  autoAssignJob?: boolean;
  createMissingClasses?: boolean;
  onProgress?: (done: number, total: number) => void;
}

async function readError(response: Response, fallback: string): Promise<string> {
  const body: { detail?: unknown } = await response.json().catch(() => ({}));
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join('; ');
  }
  return fallback;
}

export async function browseStorage(
  storageProfileId: string,
  prefix: string,
  token?: string | null,
  imagesOnly = true,
): Promise<BrowseResponse> {
  const response = await apiFetch(
    withQuery(`/api/v1/storage/profiles/${storageProfileId}/browse`, {
      prefix,
      token: token || undefined,
      images_only: imagesOnly,
      page_size: 200,
    }),
  );
  if (!response.ok) {
    throw Object.assign(new Error(await readError(response, 'Failed to browse storage')), {
      status: response.status,
    });
  }
  return response.json();
}

/** Register items in server-sized batches; results keep the caller's item order. */
export async function registerImages(items: RegisterItem[], options: RegisterOptions = {}): Promise<RegisterSummary> {
  const summary: RegisterSummary = { total: 0, created: 0, updated: 0, unchanged: 0, errors: 0, results: [] };
  for (let start = 0; start < items.length; start += REGISTER_BATCH_SIZE) {
    const batch = items.slice(start, start + REGISTER_BATCH_SIZE);
    const response = await apiFetch('/api/v1/ingest/images', {
      method: 'POST',
      body: JSON.stringify({
        project_id: options.projectId || null,
        options: {
          auto_assign_job: !!options.autoAssignJob,
          create_missing_classes: !!options.createMissingClasses,
        },
        items: batch,
      }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, 'Failed to register images'));
    }
    const body: RegisterSummary = await response.json();
    summary.total += body.total;
    summary.created += body.created;
    summary.updated += body.updated;
    summary.unchanged += body.unchanged;
    summary.errors += body.errors;
    summary.results.push(
      ...body.results.map((r) => ({ ...r, index: start + r.index, storage_key: batch[r.index]?.storage_key })),
    );
    options.onProgress?.(Math.min(start + batch.length, items.length), items.length);
  }
  return summary;
}

// ── Manifest parsing ─────────────────────────────────────────────────────

export interface ParsedManifest {
  items: RegisterItem[];
  errors: string[];
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(cell); cell = ''; }
    else cell += ch;
  }
  cells.push(cell);
  return cells.map((c) => c.trim());
}

/**
 * CSV: header row with `key` (or `storage_key`) and optionally `width`, `height`,
 * `external_id`, `name`, `tags` (separated by ";"). JSON: an array of items, or
 * {"items": [...]}, in the ingest API's item format (annotations allowed).
 */
export function parseManifest(text: string, filename: string): ParsedManifest {
  const errors: string[] = [];
  const items: RegisterItem[] = [];
  const trimmed = text.trim();

  if (filename.toLowerCase().endsWith('.json') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data: unknown = JSON.parse(trimmed);
      const rows = (Array.isArray(data) ? data : (data as { items?: unknown })?.items) as
        Record<string, unknown>[] | undefined;
      if (!Array.isArray(rows)) return { items, errors: ['JSON must be an array of items or {"items": [...]}'] };
      rows.forEach((row, i) => {
        const key = row?.storage_key || row?.key;
        if (!key) { errors.push(`item ${i + 1}: missing storage_key`); return; }
        const rest = { ...row };
        delete rest.key;
        items.push({ ...rest, storage_key: String(key) });
      });
    } catch (e) {
      errors.push(`Invalid JSON: ${(e as Error).message}`);
    }
    return { items, errors };
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { items, errors: ['The file is empty'] };
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const keyCol = header.findIndex((h) => h === 'key' || h === 'storage_key');
  if (keyCol < 0) return { items, errors: ['CSV needs a header row with a "key" column'] };
  const col = (name: string) => header.indexOf(name);

  lines.slice(1).forEach((line, i) => {
    const cells = splitCsvLine(line);
    const key = cells[keyCol];
    if (!key) { errors.push(`row ${i + 2}: empty key`); return; }
    const item: RegisterItem = { storage_key: key };
    const width = col('width') >= 0 ? parseInt(cells[col('width')], 10) : NaN;
    const height = col('height') >= 0 ? parseInt(cells[col('height')], 10) : NaN;
    if (!isNaN(width) && !isNaN(height)) { item.width = width; item.height = height; }
    if (col('external_id') >= 0 && cells[col('external_id')]) item.external_id = cells[col('external_id')];
    if (col('name') >= 0 && cells[col('name')]) item.name = cells[col('name')];
    if (col('tags') >= 0 && cells[col('tags')]) {
      item.tags = cells[col('tags')].split(';').map((t) => t.trim()).filter(Boolean);
    }
    items.push(item);
  });
  return { items, errors };
}

/** One key per line; an optional folder prefix is prepended to relative lines. */
export function parsePastedKeys(text: string, folder = ''): string[] {
  const base = folder.trim().replace(/^\/+/, '');
  const prefix = base && !base.endsWith('/') ? `${base}/` : base;
  return Array.from(new Set(
    text.split(/\r?\n/)
      .map((l) => l.trim().replace(/^\/+/, ''))
      .filter(Boolean)
      .map((k) => (prefix && !k.startsWith(prefix) ? `${prefix}${k}` : k)),
  ));
}

// ── Hooks ────────────────────────────────────────────────────────────────

export const useBrowseStorage = (
  storageProfileId: string | undefined,
  prefix: string,
  token: string | null,
  imagesOnly: boolean,
) => {
  const { currentOrganization } = useCurrentOrganization();
  return useQuery({
    queryKey: ['storageBrowse', currentOrganization?.id, storageProfileId, prefix, token, imagesOnly],
    queryFn: () => browseStorage(storageProfileId!, prefix, token, imagesOnly),
    enabled: !!currentOrganization && !!storageProfileId,
    retry: (count, error: HttpError) => error?.status !== 403 && count < 2,
    staleTime: 30 * 1000,
  });
};

/** Invalidate every image list a registration can change. */
export const useInvalidateImageLists = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useCurrentOrganization();
  return (projectId?: string) => {
    const orgId = currentOrganization?.id;
    queryClient.invalidateQueries({ queryKey: ['images', orgId] });
    queryClient.invalidateQueries({ queryKey: ['storageBrowse', orgId] });
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['projectImages', orgId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, orgId] });
    }
  };
};
