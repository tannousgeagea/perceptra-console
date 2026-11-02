import { memo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";
import { Copy, ExternalLink, MoreVertical, Pencil, Trash2, Users, ImageIcon, Tag } from "lucide-react";
import type { Project } from "@/types/project";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface ProjectCardProps {
  project: Project;
  /** Where the card navigates to. */
  href: string;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  /** Warm the project's data on hover/focus so opening it feels instant. */
  onPrefetch?: (project: Project) => void;
}

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="text-center">
    <div className="mb-1 flex items-center justify-center text-muted-foreground">{icon}</div>
    <div className="text-sm font-semibold tabular-nums">{value.toLocaleString()}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

/**
 * Navigation is a real <Link> stretched over the whole card ("stretched link"),
 * so cmd/ctrl/middle-click open a new tab and keyboard users get one tab stop.
 * The action menu is a *sibling* layered above it, never a descendant, so no
 * click inside the menu (or its portaled content) can trigger navigation.
 */
export const ProjectCard = memo(({ project, href, onEdit, onDelete, onPrefetch }: ProjectCardProps) => {
  const { copy } = useCopyToClipboard();
  const prefetch = () => onPrefetch?.(project);
  const updated = new Date(project.last_edited);

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg focus-within:shadow-lg",
        "has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-ring"
      )}
      onMouseEnter={prefetch}
    >
      <Link
        to={href}
        data-card-link
        aria-label={`Open project ${project.name}`}
        onFocus={prefetch}
        className="absolute inset-0 z-10 rounded-[inherit] focus:outline-none"
      />

      <div className="relative h-44 overflow-hidden bg-muted">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              !project.is_active && "grayscale"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-14 w-14 text-muted-foreground/60" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />

        <div className="absolute left-2 top-2">
          <Badge variant={project.is_active ? "default" : "secondary"}>
            {project.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* z-20: above the stretched link */}
        <div className="absolute right-2 top-2 z-20">
          {/* modal={false}: no body pointer-events lock, so opening a dialog
              from a menu item never leaves the page unclickable. */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label={`Actions for ${project.name}`}
                className={cn(
                  "h-8 w-8 shadow-sm transition-opacity",
                  "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                  "[@media(hover:none)]:opacity-100"
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={href} target="_blank" rel="noopener">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void copy(project.project_id, "Project ID")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy project ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onEdit(project)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(project)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="mb-1 truncate text-lg font-semibold" title={project.name}>
            {project.name}
          </h3>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
            {project.description || <span className="italic opacity-70">No description</span>}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{project.project_type_name}</Badge>
          <Badge variant="outline">{project.visibility_name}</Badge>
          <Badge variant="outline" className="capitalize">{project.user_role}</Badge>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t pt-3">
          <Stat icon={<ImageIcon className="h-3 w-3" />} value={project.statistics.total_images} label="Images" />
          <Stat icon={<Tag className="h-3 w-3" />} value={project.statistics.total_annotations} label="Annotations" />
          <Stat icon={<Users className="h-3 w-3" />} value={project.statistics.annotation_groups} label="Groups" />
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span title={`Created ${format(new Date(project.created_at), "PPP")}`}>
            Updated {formatDistanceToNow(updated, { addSuffix: true })}
          </span>
          {project.created_by && (
            <span className="truncate" title="Created by">
              {project.created_by.first_name} {project.created_by.last_name}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});
ProjectCard.displayName = "ProjectCard";
