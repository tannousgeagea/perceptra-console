// pages/register/RegisterFromStorage.tsx
//
// Register images that already live in a connected storage profile, by
// reference — the counterpart of the upload page for data you do not want to
// copy (e.g. an external, read-only storage owned by another system).
// Files are picked by browsing the storage, pasting keys, or a CSV/JSON
// manifest; sizes are read from the image headers by the hub when unknown.

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle2, ChevronRight, FileUp, Folder, FolderOpen, HardDrive, ImageIcon, Loader2, Lock, XCircle,
} from 'lucide-react';

import Header from '@/components/ui/header/Header';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Progress } from '@/components/ui/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import { Textarea } from '@/components/ui/ui/textarea';
import { TagInput } from '@/components/upload/TagInput';
import { useStorageProfiles } from '@/hooks/useStorage';
import {
  HttpError,
  RegisterItem,
  RegisterSummary,
  parseManifest,
  parsePastedKeys,
  registerImages,
  useBrowseStorage,
  useInvalidateImageLists,
} from '@/hooks/useRegisterFromStorage';

type Source = 'browse' | 'paste' | 'manifest';

const panel = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

// ── Browse ───────────────────────────────────────────────────────────────

interface BrowserProps {
  profileId: string;
  selected: Set<string>;
  onToggle: (keys: string[], checked: boolean) => void;
}

const StorageBrowser: React.FC<BrowserProps> = ({ profileId, selected, onToggle }) => {
  const [prefix, setPrefix] = useState('');
  const [tokens, setTokens] = useState<(string | null)[]>([null]); // page history of the current folder
  const [imagesOnly, setImagesOnly] = useState(true);
  const token = tokens[tokens.length - 1];
  const { data, isLoading, error } = useBrowseStorage(profileId, prefix, token, imagesOnly);

  const open = (next: string) => { setPrefix(next); setTokens([null]); };
  const crumbs = prefix.split('/').filter(Boolean);
  const selectable = (data?.files || []).filter((f) => !f.registered).map((f) => f.key);
  const allOnPage = selectable.length > 0 && selectable.every((k) => selected.has(k));

  if ((error as HttpError | null)?.status === 403) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium"><Lock className="h-4 w-4" /> This storage cannot be listed</div>
        <p className="mt-1 text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => open('')}><HardDrive className="h-4 w-4 mr-1" />root</Button>
          {crumbs.map((part, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button variant="ghost" size="sm" onClick={() => open(`${crumbs.slice(0, i + 1).join('/')}/`)}>{part}</Button>
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={imagesOnly} onCheckedChange={(v) => { setImagesOnly(!!v); setTokens([null]); }} />
            Images only
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={allOnPage} disabled={!selectable.length} onCheckedChange={(v) => onToggle(selectable, !!v)} />
            Select page
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{(error as Error).message}</div>
      ) : (
        <div className="border rounded-md divide-y max-h-[420px] overflow-y-auto">
          {prefix && (
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
              onClick={() => open(crumbs.length > 1 ? `${crumbs.slice(0, -1).join('/')}/` : '')}>
              <ArrowLeft className="h-4 w-4" /> ..
            </button>
          )}
          {data?.folders.map((folder) => (
            <button key={folder} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
              onClick={() => open(folder)}>
              <Folder className="h-4 w-4 text-amber-500" /> {folder.slice(prefix.length)}
            </button>
          ))}
          {data?.files.map((file) => (
            <label key={file.key} className={`flex items-center gap-3 px-3 py-2 text-sm ${file.registered ? 'opacity-60' : 'cursor-pointer hover:bg-muted'}`}>
              <Checkbox
                checked={file.registered || selected.has(file.key)}
                disabled={file.registered}
                onCheckedChange={(v) => onToggle([file.key], !!v)}
              />
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate" title={file.key}>{file.name}</span>
              {file.registered && <Badge variant="secondary">linked</Badge>}
              <span className="text-xs text-muted-foreground w-20 text-right">{formatBytes(file.size)}</span>
            </label>
          ))}
          {!data?.folders.length && !data?.files.length && (
            <div className="px-3 py-8 text-sm text-center text-muted-foreground"><FolderOpen className="h-5 w-5 mx-auto mb-1" />Empty folder</div>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" disabled={tokens.length <= 1} onClick={() => setTokens(tokens.slice(0, -1))}>Previous page</Button>
        <Button variant="outline" size="sm" disabled={!data?.next_token} onClick={() => setTokens([...tokens, data!.next_token!])}>Next page</Button>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────

export const RegisterFromStorage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const invalidate = useInvalidateImageLists();
  const { data: profilesData, isLoading: profilesLoading } = useStorageProfiles();
  const profiles = useMemo(
    // External profiles first: they are what this page is mostly for.
    () => [...(profilesData?.profiles || [])]
      .sort((a, b) => Number(b.access_mode === 'external_readonly') - Number(a.access_mode === 'external_readonly')),
    [profilesData],
  );

  const [profileId, setProfileId] = useState<string>('');
  const [source, setSource] = useState<Source>('browse');
  const [browseSelection, setBrowseSelection] = useState<Set<string>>(new Set());
  const [pasted, setPasted] = useState('');
  const [pasteFolder, setPasteFolder] = useState('');
  const [manifest, setManifest] = useState<{ name: string; items: RegisterItem[]; errors: string[] } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [autoAssignJob, setAutoAssignJob] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [summary, setSummary] = useState<RegisterSummary | null>(null);

  const activeProfile = profiles.find((p) => p.storage_profile_id === profileId);
  const pastedKeys = useMemo(() => parsePastedKeys(pasted, pasteFolder), [pasted, pasteFolder]);

  const items: RegisterItem[] = useMemo(() => {
    if (!profileId) return [];
    const withDefaults = (item: RegisterItem): RegisterItem => ({
      ...item,
      ...(item.storage_profile_id || item.storage_profile_name ? {} : { storage_profile_id: profileId }),
      tags: Array.from(new Set([...(item.tags || []), ...tags])),
    });
    if (source === 'browse') return Array.from(browseSelection).map((key) => withDefaults({ storage_key: key }));
    if (source === 'paste') return pastedKeys.map((key) => withDefaults({ storage_key: key }));
    return (manifest?.items || []).map(withDefaults);
  }, [profileId, source, browseSelection, pastedKeys, manifest, tags]);

  const toggleBrowse = (keys: string[], checked: boolean) => {
    setBrowseSelection((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
      return next;
    });
  };

  const onManifest = async (file?: File) => {
    if (!file) return;
    const parsed = parseManifest(await file.text(), file.name);
    setManifest({ name: file.name, ...parsed });
  };

  const register = async () => {
    if (!items.length) return;
    setSummary(null);
    setProgress(0);
    try {
      const result = await registerImages(items, {
        projectId,
        autoAssignJob,
        onProgress: (done, total) => setProgress(Math.round((100 * done) / total)),
      });
      setSummary(result);
      invalidate(projectId);
      const done = result.created + result.updated + result.unchanged;
      if (result.errors) toast.warning(`${done} linked, ${result.errors} failed`);
      else toast.success(`${done} image${done === 1 ? '' : 's'} linked`);
      if (source === 'browse') setBrowseSelection(new Set());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  const description = projectId
    ? 'Link images from connected storage to this project — they stay where they are, nothing is uploaded or copied.'
    : "Link images from connected storage to your organization's data lake — they stay where they are, nothing is uploaded or copied.";

  return (
    <div className="space-y-6 p-6 w-full">
      <Header title="Link Data" description={description} />

      <div className={`${panel} space-y-4`}>
        <h2 className="text-lg font-semibold">1. Storage</h2>
        <div className="max-w-xl space-y-2">
          <Label>Storage profile</Label>
          <Select value={profileId} onValueChange={(v) => { setProfileId(v); setBrowseSelection(new Set()); setSummary(null); }}>
            <SelectTrigger><SelectValue placeholder={profilesLoading ? 'Loading…' : 'Choose a storage profile'} /></SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.storage_profile_id} value={p.storage_profile_id!}>
                  {p.name} · {p.backend}{p.access_mode === 'external_readonly' ? ' · external (read-only)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!profilesLoading && !profiles.length && (
            <p className="text-sm text-muted-foreground">
              No storage connected yet. Add one in Settings → Storage (choose "External (read-only)" for storage owned by another system).
            </p>
          )}
          {activeProfile?.access_mode === 'external_readonly' && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" /> External storage: files are referenced in place and never modified or deleted.
            </p>
          )}
        </div>
      </div>

      {profileId && (
        <div className={`${panel} space-y-4`}>
          <h2 className="text-lg font-semibold">2. Select images</h2>
          <Tabs value={source} onValueChange={(v) => setSource(v as Source)}>
            <TabsList>
              <TabsTrigger value="browse">Browse{browseSelection.size ? ` (${browseSelection.size})` : ''}</TabsTrigger>
              <TabsTrigger value="paste">Paste keys{pastedKeys.length ? ` (${pastedKeys.length})` : ''}</TabsTrigger>
              <TabsTrigger value="manifest">Manifest{manifest?.items.length ? ` (${manifest.items.length})` : ''}</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="pt-4">
              <StorageBrowser profileId={profileId} selected={browseSelection} onToggle={toggleBrowse} />
            </TabsContent>

            <TabsContent value="paste" className="pt-4 space-y-3">
              <div className="space-y-2 max-w-xl">
                <Label htmlFor="pasteFolder">Folder (optional, prepended to each line)</Label>
                <Input id="pasteFolder" placeholder="images/2026/10/" value={pasteFolder} onChange={(e) => setPasteFolder(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastedKeys">File keys, one per line</Label>
                <Textarea id="pastedKeys" rows={8} placeholder={'images/2026/10/frame-001.jpg\nimages/2026/10/frame-002.jpg'}
                  value={pasted} onChange={(e) => setPasted(e.target.value)} />
                <p className="text-sm text-muted-foreground">Works with read-only credentials that cannot list the storage.</p>
              </div>
            </TabsContent>

            <TabsContent value="manifest" className="pt-4 space-y-3">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm">{manifest ? manifest.name : 'Choose a .csv or .json manifest'}</span>
                <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden"
                  onChange={(e) => onManifest(e.target.files?.[0])} />
              </label>
              <p className="text-sm text-muted-foreground">
                CSV: a header row with <code>key</code> and optionally <code>width</code>, <code>height</code>,{' '}
                <code>external_id</code>, <code>name</code>, <code>tags</code> (separated by ";").
                JSON: an array of ingest items (annotations allowed).
              </p>
              {manifest && (
                <div className="text-sm">
                  <span className="font-medium">{manifest.items.length}</span> image(s) read
                  {manifest.errors.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-red-600">
                      {manifest.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                      {manifest.errors.length > 10 && <li>… {manifest.errors.length - 10} more</li>}
                    </ul>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {profileId && (
        <div className={`${panel} space-y-4`}>
          <h2 className="text-lg font-semibold">3. Link</h2>
          <div>
            <h3 className="text-md font-medium mb-2">Add Tags (optional)</h3>
            <TagInput tags={tags} onChange={setTags} disabled={busy} />
          </div>
          {projectId && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={autoAssignJob} onCheckedChange={(v) => setAutoAssignJob(!!v)} />
              Assign the images to annotation jobs
            </label>
          )}
          {busy && <Progress value={progress!} />}
          <div className="flex items-center gap-3">
            <Button onClick={register} disabled={!items.length || busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Link {items.length || ''} image{items.length === 1 ? '' : 's'}
            </Button>
            {summary && projectId && (
              <Button variant="outline" onClick={() => navigate(`/projects/${projectId}/dataset`)}>Go to dataset</Button>
            )}
            {summary && !projectId && (
              <Button variant="outline" onClick={() => navigate('/datalake')}>Go to data lake</Button>
            )}
          </div>

          {summary && (
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 flex-wrap">
                <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" />{summary.created} created</Badge>
                <Badge variant="secondary">{summary.updated} updated</Badge>
                <Badge variant="secondary">{summary.unchanged} already linked</Badge>
                {summary.errors > 0 && <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{summary.errors} failed</Badge>}
              </div>
              {summary.errors > 0 && (
                <ul className="list-disc pl-5 text-red-600 max-h-48 overflow-y-auto">
                  {summary.results.filter((r) => r.status === 'error').map((r) => (
                    <li key={r.index}><code>{r.storage_key}</code>: {r.error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegisterFromStorage;
