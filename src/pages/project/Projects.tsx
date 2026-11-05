import { FC, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ContinueCard } from '@/components/resume/ContinueCard';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useUserJobs } from '@/hooks/useUserJobs';
import { useCurrentOrganization } from '@/hooks/useAuthHelpers';
import { fetchProjectById } from '@/hooks/useProjectDetails';
import { useDeleteProject, useUpdateProject } from '@/hooks/useProjectMutations';
import { NotificationSidebar } from "@/components/jobs/NotificationSidebar";
import { AlertTriangle, FolderPlus, Search, Plus, ArrowUpDown, Bell, X } from 'lucide-react';

import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
import { Skeleton } from "@/components/ui/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";

import { Badge } from "@/components/ui/ui/badge";
import { ProjectCard } from "@/components/project/ProjectCardV2";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import type { Project, ProjectUpdate, SortField, SortDirection } from "@/types/project";

const DEFAULT_SORT = "created_at-desc";
const DEFAULT_STATUS = "all";

const sortValue = (p: Project, field: SortField): string | number => {
    switch (field) {
        case "name": return p.name.toLowerCase();
        case "total_images": return p.statistics.total_images;
        case "total_annotations": return p.statistics.total_annotations;
        default: return new Date(p.created_at).getTime();
    }
};

const projectHref = (projectId: string) => `/projects/${projectId}/dataset`;

const Projects: FC = () => {
    // The page has an Active / Inactive filter, so it needs both.
    const { data: projects, isLoading, error, refetch } = useUserProjects({ includeInactive: true });
    // Notifications are secondary: never block or blank the page on them.
    const { data: jobs } = useUserJobs();
    const toFixTotal = (jobs ?? []).reduce((sum, job) => sum + (job.to_fix ?? 0), 0);
    const { currentOrganization, isAdmin: isOrgAdmin, isOwner: isOrgOwner } = useCurrentOrganization();
    // Mirrors the API: org admins/owners can do anything; project owners/admins can edit.
    const canDelete = isOrgAdmin || isOrgOwner;
    const canEdit = useCallback(
        (p: Project) => canDelete || ["owner", "admin"].includes(p.user_role),
        [canDelete]
    );
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Search / filter / sort live in the URL: coming back from a project
    // restores exactly the view you left, and the view is shareable.
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("q") ?? "";
    const filterActive = searchParams.get("status") ?? DEFAULT_STATUS;
    const sort = searchParams.get("sort") ?? DEFAULT_SORT;
    const [sortField, sortDirection] = sort.split("-") as [SortField, SortDirection];

    const setParam = useCallback((key: string, value: string, fallback: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (!value || value === fallback) next.delete(key);
            else next.set(key, value);
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const [editTarget, setEditTarget] = useState<Project | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);

    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    // "/" focuses search (unless typing elsewhere); Esc in the box clears it.
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (e.key !== "/" || target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
            e.preventDefault();
            searchRef.current?.focus();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const prefetchProject = useCallback((project: Project) => {
        if (!currentOrganization) return;
        queryClient.prefetchQuery({
            queryKey: ['project', project.project_id, currentOrganization.id],
            queryFn: () => fetchProjectById(project.project_id, currentOrganization.id),
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient, currentOrganization]);

    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects ?? [];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.project_type_name.toLowerCase().includes(query)
            );
        }

        if (filterActive !== "all") {
            filtered = filtered.filter((p) => (filterActive === "active" ? p.is_active : !p.is_active));
        }

        const dir = sortDirection === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const av = sortValue(a, sortField);
            const bv = sortValue(b, sortField);
            return av === bv ? 0 : (av > bv ? 1 : -1) * dir;
        });
    }, [projects, searchQuery, sortField, sortDirection, filterActive]);

    const hasFilters = !!searchQuery || filterActive !== DEFAULT_STATUS;
    const clearFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

    const handleEditProject = (id: string, data: ProjectUpdate) => {
        updateProject.mutate({ projectId: id, data }, { onSuccess: () => setEditTarget(null) });
    };

    const handleReactivate = useCallback((project: Project) => {
        updateProject.mutate({ projectId: project.project_id, data: { is_active: true } });
    }, [updateProject]);

    const handleDeleteProject = () => {
        if (!deleteTarget) return;
        // The card disappears optimistically and the toast offers Undo.
        deleteProject.mutate(deleteTarget);
        setDeleteTarget(null);
    };

    const renderBody = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-lg border bg-card">
                            <Skeleton className="h-44 w-full rounded-none" />
                            <div className="space-y-3 p-4">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                    <div>
                        <h3 className="text-lg font-semibold">Couldn't load projects</h3>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()}>Try again</Button>
                </div>
            );
        }

        if (!projects?.length) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <FolderPlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No projects yet</h3>
                        <p className="text-sm text-muted-foreground">Create your first project to start uploading and annotating images.</p>
                    </div>
                    <Button onClick={() => navigate('/projects/add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>
            );
        }

        if (filteredAndSortedProjects.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        No projects match {searchQuery ? <>“<span className="font-medium text-foreground">{searchQuery}</span>”</> : "these filters"}.
                    </p>
                    <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map((project) => (
                    <ProjectCard
                        key={project.project_id}
                        project={project}
                        href={projectHref(project.project_id)}
                        onEdit={canEdit(project) ? setEditTarget : undefined}
                        onDelete={canDelete ? setDeleteTarget : undefined}
                        onReactivate={canEdit(project) ? handleReactivate : undefined}
                        onPrefetch={prefetchProject}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 w-full min-h-full overflow-auto bg-slate-50 dark:bg-background">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your organization's annotation projects
                            {projects && projects.length > 0 && (
                                <span className="ml-1 tabular-nums">
                                    · {hasFilters ? `${filteredAndSortedProjects.length} of ${projects.length}` : projects.length}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setNotificationSidebarOpen(true)}
                            className="relative"
                            aria-label="Training notifications"
                        >
                            <Bell className="h-4 w-4" />
                            {!!jobs?.length && (
                                <Badge
                                    variant={toFixTotal > 0 ? "destructive" : "secondary"}
                                    className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 flex items-center justify-center text-xs"
                                    title={toFixTotal > 0 ? `${toFixTotal} images sent back to you` : `${jobs.length} assigned jobs`}
                                >
                                    {toFixTotal > 0 ? toFixTotal : jobs.length}
                                </Badge>
                            )}
                        </Button>
                        <Button onClick={() => navigate('/projects/add')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>

                <ContinueCard />

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            placeholder="Search projects by name, description, or type..."
                            value={searchQuery}
                            onChange={(e) => setParam("q", e.target.value, "")}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    setParam("q", "", "");
                                    e.currentTarget.blur();
                                }
                            }}
                            className="pl-10 pr-16"
                            aria-label="Search projects"
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => setParam("q", "", "")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : (
                            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
                                /
                            </kbd>
                        )}
                    </div>

                    <Select value={filterActive} onValueChange={(v) => setParam("status", v, DEFAULT_STATUS)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={(v) => setParam("sort", v, DEFAULT_SORT)}>
                        <SelectTrigger className="w-[200px]">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at-desc">Newest First</SelectItem>
                            <SelectItem value="created_at-asc">Oldest First</SelectItem>
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="total_images-desc">Most Images</SelectItem>
                            <SelectItem value="total_images-asc">Fewest Images</SelectItem>
                            <SelectItem value="total_annotations-desc">Most Annotations</SelectItem>
                            <SelectItem value="total_annotations-asc">Fewest Annotations</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {renderBody()}
            </div>

            <EditProjectDialog
                open={!!editTarget}
                onOpenChange={(open) => !open && setEditTarget(null)}
                project={editTarget}
                onSubmit={handleEditProject}
                isSaving={updateProject.isPending}
            />

            <DeleteProjectDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                project={deleteTarget}
                onConfirm={handleDeleteProject}
                isDeleting={deleteProject.isPending}
            />

            <NotificationSidebar
                isOpen={notificationSidebarOpen}
                onClose={() => setNotificationSidebarOpen(false)}
                jobs={jobs ?? []}
            />
        </div>
    );
};

export default Projects;
