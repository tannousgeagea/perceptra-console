// The organization's tags with how often each is used; org editors can rename,
// recolour, merge and delete them. With a projectId, only tags used in that
// project are listed (and counted there), but changes still apply org-wide.
import { useMemo, useState } from 'react';
import { Loader2, Lock, Pencil, Search, Tag as TagIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Label } from '@/components/ui/ui/label';
import { Textarea } from '@/components/ui/ui/textarea';
import { Skeleton } from '@/components/ui/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/ui/dialog';
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
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import {
  TagNameTakenError,
  useDeleteTag,
  useManagedTags,
  useUpdateTag,
} from '@/hooks/useTagManagement';
import type { ManagedTag, TagKind, TagUpdate } from '@/types/tags';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function usageText(kind: TagKind, tag: ManagedTag): string {
  if (kind === 'image') return plural(tag.usage.images, 'image');
  const parts = [];
  if (tag.usage.models) parts.push(plural(tag.usage.models, 'model'));
  if (tag.usage.versions) parts.push(plural(tag.usage.versions, 'version'));
  return parts.join(', ');
}

const isUnused = (kind: TagKind, tag: ManagedTag) =>
  kind === 'image' ? tag.usage.images === 0 : tag.usage.models + tag.usage.versions === 0;

const HEX = /^#[0-9a-fA-F]{6}$/;

interface TagManagerProps {
  projectId?: string;
}

export function TagManager({ projectId }: TagManagerProps) {
  return (
    <Tabs defaultValue="image" className="space-y-4">
      <TabsList>
        <TabsTrigger value="image">Image tags</TabsTrigger>
        <TabsTrigger value="model">Model tags</TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <TagList kind="image" projectId={projectId} />
      </TabsContent>
      <TabsContent value="model">
        <TagList kind="model" projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}

function TagList({ kind, projectId }: { kind: TagKind; projectId?: string }) {
  const { hasEditPermission: canEdit } = useCurrentOrganization();
  const { data: tags, isLoading, error } = useManagedTags(kind, projectId);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ManagedTag | null>(null);
  const [deleting, setDeleting] = useState<ManagedTag | null>(null);
  const deleteTag = useDeleteTag(kind);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (tags ?? []).filter(
      (t) => !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
    );
  }, [tags, search]);

  const confirmDelete = () => {
    if (!deleting) return;
    const tag = deleting;
    deleteTag.mutate(tag.id, {
      onSuccess: () => {
        toast.success(`Deleted "${tag.name}"`);
        setDeleting(null);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete the tag'),
    });
  };

  const owner = kind === 'image' ? 'image' : 'model and version';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {projectId
          ? `Tags on this project's ${kind === 'image' ? 'images' : 'models'}, counted in this project. Tags belong to the organization: a rename, merge or delete applies everywhere.`
          : `Every ${kind} tag in the organization and how often it's used.`}
        {!canEdit && ' Editors of the organization can change them.'}
      </p>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a tag"
          aria-label="Find a tag"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn't load tags: {error instanceof Error ? error.message : 'unknown error'}
        </p>
      ) : !tags?.length ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed py-12 text-center">
          <TagIcon className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No {kind} tags yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {kind === 'image'
              ? 'Tags appear here once images are tagged, for example while uploading or from the image list.'
              : 'Tags appear here once models are tagged when creating or editing a model.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <ul className="divide-y">
            {shown.map((tag) => (
              <li key={tag.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{tag.name}</span>
                    {tag.protected && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        title="Set by the platform: it can be recoloured but not renamed or deleted"
                      >
                        <Lock className="h-3 w-3" /> Set by the platform
                      </span>
                    )}
                  </div>
                  {tag.description && (
                    <p className="truncate text-xs text-muted-foreground">{tag.description}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-sm tabular-nums ${isUnused(kind, tag) ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}
                >
                  {isUnused(kind, tag) ? 'Unused' : usageText(kind, tag)}
                </span>
                {canEdit && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditing(tag)}
                      aria-label={`Edit ${tag.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleting(tag)}
                      disabled={tag.protected}
                      aria-label={`Delete ${tag.name}`}
                      title={tag.protected ? "Set by the platform; it can't be deleted" : undefined}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No tag matches "{search.trim()}".
              </li>
            )}
          </ul>
        </div>
      )}

      {editing && (
        <EditTagDialog kind={kind} tag={editing} onClose={() => setEditing(null)} />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && projectId
                ? `It will be removed from every ${owner} in the organization that has it. `
                : deleting && isUnused(kind, deleting)
                  ? `Nothing uses it. `
                  : deleting
                    ? `It will be removed from ${usageText(kind, deleting)}. `
                    : ''}
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTag.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteTag.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditTagDialog({ kind, tag, onClose }: { kind: TagKind; tag: ManagedTag; onClose: () => void }) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [description, setDescription] = useState(tag.description ?? '');
  // Set when the new name belongs to another tag: ask before merging.
  const [mergeInto, setMergeInto] = useState<ManagedTag | null>(null);
  const updateTag = useUpdateTag(kind);

  const trimmed = name.trim();
  const colorValid = HEX.test(color);
  const changes: TagUpdate = {};
  if (trimmed !== tag.name) changes.name = trimmed;
  if (color.toLowerCase() !== tag.color.toLowerCase()) changes.color = color;
  if (description.trim() !== (tag.description ?? '')) changes.description = description.trim();
  const canSave = !!trimmed && colorValid && Object.keys(changes).length > 0 && !updateTag.isPending;

  const save = (merge = false) => {
    updateTag.mutate(
      { id: tag.id, update: merge ? { ...changes, merge: true } : changes },
      {
        onSuccess: (saved) => {
          toast.success(merge ? `Merged "${tag.name}" into "${saved.name}"` : `Saved "${saved.name}"`);
          onClose();
        },
        onError: (e) => {
          if (e instanceof TagNameTakenError) setMergeInto(e.existing);
          else toast.error(e instanceof Error ? e.message : 'Could not save the tag');
        },
      },
    );
  };

  return (
    <>
      <Dialog open={!mergeInto} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit tag</DialogTitle>
            <DialogDescription>
              Changes apply to every {kind === 'image' ? 'image' : 'model'} in the organization with this tag.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSave) save();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={tag.protected}
                maxLength={kind === 'image' ? 100 : 50}
              />
              <p className="text-xs text-muted-foreground">
                {tag.protected
                  ? 'Set by the platform, so the name stays. You can change its colour and description.'
                  : 'Use the name of an existing tag to merge the two.'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag-color">Colour</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Pick a colour"
                  value={colorValid ? color : '#3b82f6'}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-1"
                />
                <Input
                  id="tag-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-32 font-mono"
                  aria-invalid={!colorValid}
                />
              </div>
              {!colorValid && <p className="text-xs text-destructive">Use a hex colour like #3B82F6.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What this tag marks"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={updateTag.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                {updateTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!mergeInto} onOpenChange={(open) => !open && setMergeInto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Merge "{tag.name}" into "{mergeInto?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A tag named "{mergeInto?.name}" already exists
              {mergeInto && !isUnused(kind, mergeInto) ? ` on ${usageText(kind, mergeInto)}` : ''}.
              Merging gives everything tagged "{tag.name}" the tag "{mergeInto?.name}" and deletes "{tag.name}".
              "{mergeInto?.name}" keeps its own colour and description. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateTag.isPending}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                save(true);
              }}
              disabled={updateTag.isPending}
            >
              {updateTag.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Merge tags
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
