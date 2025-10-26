import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '@/components/project/ProjectCard';
import Header from '@/components/ui/header/Header';
import { useUserProjects } from '@/hooks/useUserProjects';
import { NotificationSidebar } from "@/components/jobs/NotificationSidebar";
import { Grid, List, Search, Filter, Plus } from 'lucide-react';

const Projects: FC = () => {
    const { data: projects, isLoading, error } = useUserProjects();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    const handleNewProject = (): void => {
        navigate('/projects/add')
    }

    const handleViewProject = (projectId: string): void => {
        navigate(`/projects/${projectId}/dataset`);
    };

    const filteredProjects = projects?.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) return (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your projects...</p>
            </div>
        </div>
    )

    if (!projects) return (
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

    return (
        <div className="p-6 w-full overflow-auto bg-slate-50">
            <Header
            title="Projects"
            description="Organize and manage your visual data"
            />


            <div className="sticky top-0 z-10 bg-white bg-opacity-80 backdrop-blur-lg border-b border-gray-200">
                <div className="mx-auto py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <div className="bg-gray-100 rounded-xl p-1 flex">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === 'grid' 
                                    ? 'bg-white shadow-sm text-indigo-600' 
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                    viewMode === 'list' 
                                        ? 'bg-white shadow-sm text-indigo-600' 
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Filter Button */}
                            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                                <Filter className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Create Project Button */}
                            <button 
                                onClick={handleNewProject}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                New Project
                            </button>
                        </div>  
                    </div>
                </div>
            </div>

            <div className="mx-auto py-8">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className={`grid gap-8 ${
                        viewMode === 'grid' 
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                            : 'grid-cols-1 max-w-3xl mx-auto'
                    }`}>
                        {filteredProjects.map((project, index) => (
                            <div
                                key={index}
                                className="animate-in fade-in slide-in-from-bottom duration-500"
                                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                            >
                                <ProjectCard
                                    project={project}
                                    onView={handleViewProject}
                                    key={index}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <NotificationSidebar />
        </div>
    );
};

export default Projects;