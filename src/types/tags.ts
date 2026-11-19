// Organization tags as /api/v1/tags/{kind} returns them.

export type TagKind = 'image' | 'model';

export interface TagUsage {
  images: number;
  models: number;
  versions: number;
}

export interface ManagedTag {
  id: number;
  name: string;
  description: string | null;
  color: string;
  /** Set by the platform ("archived", "baseline"): can be recoloured, not renamed or deleted. */
  protected: boolean;
  usage: TagUsage;
}

export interface TagUpdate {
  name?: string;
  color?: string;
  description?: string;
  /** Renaming into another tag's name merges this tag into it. */
  merge?: boolean;
}
