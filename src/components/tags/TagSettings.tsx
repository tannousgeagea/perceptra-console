import { TagManager } from './TagManager';

/** Settings → Tags: every image and model tag in the organization. */
export function TagSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tags</h2>
        <p className="text-sm text-muted-foreground">
          Rename, recolour, merge or delete the tags used across your organization.
        </p>
      </div>
      <TagManager />
    </div>
  );
}
