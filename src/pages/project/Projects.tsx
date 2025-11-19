import { FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/ui/header/Header';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useUserJobs } from '@/hooks/useUserJobs';
import { NotificationSidebar } from "@/components/jobs/NotificationSidebar";
import { Grid, List, Search, Filter, Plus, ArrowUpDown, Bell } from 'lucide-react';

import { Button } from "@/components/ui/ui/button";
import { Input } from "@/components/ui/ui/input";
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
import type { Project, ProjectCreateData, ProjectUpdate, SortField, SortDirection } from "@/types/project";
import { toast } from "sonner";

const Projects: FC = () => {
    const { data: projects, isLoading, error } = useUserProjects();
    const { data: jobs, isLoading: loadingJobs, error: errorJobs } = useUserJobs();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [filterActive, setFilterActive] = useState<string>("all");

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);

    const navigate = useNavigate();
    
    const handleNewProject = (): void => {
        navigate('/projects/add')
    }

    const handleProjectClick = (projectId: string) => {
        navigate(`/projects/${projectId}/dataset`);
    };

    // Filter and sort projects
    const filteredAndSortedProjects = useMemo(() => {
        let filtered = projects || [];

        // Search filter
        if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered?.filter(
            (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.project_type_name.toLowerCase().includes(query)
        );
        }

        // Active status filter
        if (filterActive !== "all") {
        filtered = filtered?.filter((p) =>
            filterActive === "active" ? p.is_active : !p.is_active
        );
        }

        // Sorting
        const sorted = [...filtered].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortField === "name") {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
        } else if (sortField === "created_at") {
            aVal = new Date(a.created_at).getTime();
            bVal = new Date(b.created_at).getTime();
        } else if (sortField === "total_images") {
            aVal = a.statistics.total_images;
            bVal = b.statistics.total_images;
        } else if (sortField === "total_annotations") {
            aVal = a.statistics.total_annotations;
            bVal = b.statistics.total_annotations;
        }

        if (sortDirection === "asc") {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
        });

        return sorted;
    }, [projects, searchQuery, sortField, sortDirection, filterActive]);

    if (isLoading) return (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your projects...</p>
            </div>
        </div>
    )

    if (!projects || !jobs) return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <   div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
                <p className="text-gray-500">Create your first project to get started</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Error Loading Projects</h3>
            <p className="text-red-600">{error.message}</p>
        </div>
        </div>
    );

    const handleEditProject = (id: string, data: ProjectUpdate) => {

        setEditDialogOpen(false);
        setSelectedProject(null);
        toast.success("Project updated successfully");
    };

    const handleDeleteProject = (id: string) => {
        setDeleteDialogOpen(false);
        setSelectedProject(null);
        toast.success("Project deleted successfully");
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setDeleteDialogOpen(true);
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
        setSortField(field);
        setSortDirection("desc");
        }
    };

    return (
        <div className="p-6 w-full min-h-full overflow-auto bg-slate-50">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage your organization's annotation projects
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNotificationSidebarOpen(true)}
                        className="relative"
                        >
                        <Bell className="h-4 w-4" />
                        {jobs?.length > 0 && (
                            <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                            {jobs.length}
                            </Badge>
                        )}
                        </Button>
                        <Button onClick={handleNewProject}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects by name, description, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filterActive} onValueChange={setFilterActive}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            <SelectItem value="active">Active Only</SelectItem>
                            <SelectItem value="inactive">Inactive Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={`${sortField}-${sortDirection}`}
                        onValueChange={(value) => {
                        const [field, direction] = value.split("-");
                        setSortField(field as SortField);
                        setSortDirection(direction as SortDirection);
                        }}
                    >
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

                {filteredAndSortedProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                        {searchQuery
                            ? "No projects found matching your search."
                            : "No projects yet. Create your first project to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedProjects.map((project, index) => (
                            <div key={project.project_id} onClick={() => handleProjectClick(project.project_id)}>
                                <ProjectCard
                                    project={project}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    // onView={handleViewProject}
                                    key={index}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditProjectDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                project={selectedProject}
                onSubmit={handleEditProject}
            />

            <DeleteProjectDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                project={selectedProject}
                onConfirm={handleDeleteProject}
            />

            <NotificationSidebar
                isOpen={notificationSidebarOpen}
                onClose={() => setNotificationSidebarOpen(false)}
                jobs={jobs}
            />
        </div>
    );
};

export default Projects;