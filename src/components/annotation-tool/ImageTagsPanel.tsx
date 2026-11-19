// The image's tags in the annotator's left panel: shown to everyone; org
// editors, or editors of this project, can add (existing tags are suggested,
// a new name creates an org tag) and remove them.
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Tag as TagIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { useImageEditPermission } from '@/hooks/useImageEditPermission';
import { useAddImageTags, useManagedTags, useRemoveImageTag } from '@/hooks/useTagManagement';
import type { ProjectImageOut } from '@/types/image';

const MAX_TAG_LENGTH = 100;

export const ImageTagsPanel: React.FC<{ image: ProjectImageOut }> = ({ image }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { canTag } = useImageEditPermission(projectId);
  const { data: orgTags } = useManagedTags('image');
  const addTags = useAddImageTags();
  const removeTag = useRemoveImageTag();
  const [value, setValue] = useState('');

  const imagePk = image.image.pk;
  const tags = useMemo(() => image.image.tags ?? [], [image.image.tags]);
  const editable = canTag && imagePk != null;
  const busy = addTags.isPending || removeTag.isPending;

  // Colours come from the org's tag list; names the image has are left out of suggestions.
  const colorOf = useMemo(
    () => new Map((orgTags ?? []).map((t) => [t.name.toLowerCase(), t.color])),
    [orgTags],
  );
  const suggestions = useMemo(() => {
    const have = new Set(tags.map((t) => t.toLowerCase()));
    return (orgTags ?? []).filter((t) => !have.has(t.name.toLowerCase())).map((t) => t.name);
  }, [orgTags, tags]);

  const add = () => {
    const typed = value.trim();
    if (!typed || imagePk == null) return;
    // Reuse an existing tag's exact name when only the case differs.
    const name = (orgTags ?? []).find((t) => t.name.toLowerCase() === typed.toLowerCase())?.name ?? typed;
    if (tags.some((t) => t.toLowerCase() === name.toLowerCase())) {
      toast.info(`"${name}" is already on this image`);
      setValue('');
      return;
    }
    addTags.mutate(
      { imagePk, tags: [name] },
      {
        onSuccess: () => setValue(''),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not add the tag'),
      },
    );
  };

  const remove = (tag: string) => {
    if (imagePk == null) return;
    removeTag.mutate(
      { imagePk, tag },
      { onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not remove the tag') },
    );
  };

  const listId = `image-tag-suggestions-${image.id}`;

  return (
    <div className="shrink-0 border-t border-border px-4 py-3">
      <h4 className="mb-2 text-xs font-semibold text-foreground">Tags</h4>

      {tags.length > 0 ? (
        <ul className="mb-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto" aria-label="Tags on this image">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 pl-2 pr-1 text-[11px] text-foreground"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: colorOf.get(tag.toLowerCase()) ?? '#94a3b8' }}
                aria-hidden
              />
              <span className="truncate">{tag}</span>
              {editable ? (
                <button
                  type="button"
                  onClick={() => remove(tag)}
                  disabled={busy}
                  aria-label={`Remove tag ${tag} from this image`}
                  title="Remove from this image"
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <TagIcon className="h-3.5 w-3.5" />
          No tags on this image.
        </p>
      )}

      {editable ? (
        <form
          className="flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
            }}
            list={listId}
            maxLength={MAX_TAG_LENGTH}
            placeholder="Add a tag"
            aria-label="Add a tag to this image"
            disabled={busy}
            className="h-7 text-xs"
          />
          <datalist id={listId}>
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <Button
            type="submit"
            size="icon"
            variant="outline"
            disabled={!value.trim() || busy}
            aria-label="Add tag"
            className="h-7 w-7 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </form>
      ) : (
        <p className="text-[10px] text-muted-foreground">Editors can add and remove tags.</p>
      )}
    </div>
  );
};
