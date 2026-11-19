// A model version's tags in the versions table: chips (× to remove) and an
// "Add a tag" popover suggesting the organization's model tags. Where a version
// runs (production / staging) is its deployment status, never a tag.
import React, { useMemo, useState } from "react";
import { Plus, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/ui/popover";
import { useManagedTags } from "@/hooks/useTagManagement";

const DEPLOYMENT_NAMES = new Set(["production", "staging"]);
const MAX_TAG_LENGTH = 50;

interface VersionTagsCellProps {
  versionId: string;
  tags: string[];
  canEdit: boolean;
  busy: boolean;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export const VersionTagsCell: React.FC<VersionTagsCellProps> = ({
  versionId,
  tags,
  canEdit,
  busy,
  onAdd,
  onRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  // One request shared by every row (same query key).
  const { data: orgTags } = useManagedTags("model");

  const suggestions = useMemo(() => {
    const have = new Set(tags.map((t) => t.toLowerCase()));
    return (orgTags ?? [])
      .map((t) => t.name)
      .filter((name) => !have.has(name.toLowerCase()) && !DEPLOYMENT_NAMES.has(name.toLowerCase()));
  }, [orgTags, tags]);

  const typed = value.trim().toLowerCase();
  const problem = DEPLOYMENT_NAMES.has(typed)
    ? "Where a version runs is set with Deploy, not a tag."
    : tags.some((t) => t.toLowerCase() === typed)
      ? "This version already has that tag."
      : null;

  const submit = () => {
    if (!typed || problem) return;
    onAdd(typed);
    setValue("");
    setOpen(false);
  };

  const listId = `version-tag-suggestions-${versionId}`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-1 pr-1 text-xs font-normal"
          title={tag === "baseline" ? "The reference version: one per model" : undefined}
        >
          {tag === "baseline" && <Star className="h-3 w-3 fill-current" aria-hidden />}
          {tag}
          {canEdit ? (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              disabled={busy}
              aria-label={`Remove tag ${tag} from this version`}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-background/60 hover:text-foreground disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <span className="w-0.5" />
          )}
        </Badge>
      ))}

      {canEdit && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-xs text-muted-foreground"
              disabled={busy}
            >
              <Plus className="h-3 w-3" />
              {tags.length === 0 && "Add tag"}
              <span className="sr-only">Add a tag to this version</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3">
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label htmlFor={`${listId}-input`} className="text-xs font-medium">
                Add a tag
              </label>
              <div className="flex gap-1.5">
                <Input
                  id={`${listId}-input`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  list={listId}
                  maxLength={MAX_TAG_LENGTH}
                  placeholder="e.g. candidate"
                  className="h-8 text-sm"
                  autoFocus
                />
                <datalist id={listId}>
                  {suggestions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <Button type="submit" size="sm" className="h-8" disabled={!typed || !!problem || busy}>
                  Add
                </Button>
              </div>
              <p className={`text-xs ${problem ? "text-destructive" : "text-muted-foreground"}`}>
                {problem ?? "Pick an existing tag or type a new one."}
              </p>
            </form>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
