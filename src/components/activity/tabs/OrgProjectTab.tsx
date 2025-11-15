import { ProjectProgress } from "@/types/activity";
import { Card } from "@/components/ui/ui/card";
import { FolderKanban, Users, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/ui/progress";

interface OrgProjectsTabProps {
  projects: ProjectProgress[];
}

export const OrgProjectsTab = ({ projects }: OrgProjectsTabProps) => {
  const totalImages = projects.reduce((sum, p) => sum + p.total_images, 0);
  const totalFinalized = projects.reduce((sum, p) => sum + p.images_finalized, 0);
  const avgCompletion = projects.reduce((sum, p) => sum + p.completion_percentage, 0) / projects.length;
  const activeProjects = projects.filter(p => p.active_contributors > 0).length;

  const getStatusBadge = (project: ProjectProgress) => {
    if (project.completion_percentage >= 90) {
      return <span className="px-2 py-1 bg-success-light text-success text-xs rounded-full font-medium">Completed</span>;
    }
    if (project.active_contributors > 0) {
      return <span className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full font-medium">Active</span>;
    }
    return <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium">Stalled</span>;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold text-foreground">{avgCompletion.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-light rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Images</p>
              <p className="text-2xl font-bold text-foreground">{totalImages.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.project_id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg mb-1">{project.project_name}</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(project)}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.active_contributors} contributors
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{project.completion_percentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>

            <Progress value={project.completion_percentage} className="mb-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Images</p>
                <p className="font-semibold text-foreground">{project.total_images.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Finalized</p>
                <p className="font-semibold text-success">{project.images_finalized.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Annotated</p>
                <p className="font-semibold text-foreground">{project.images_annotated.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reviewed</p>
                <p className="font-semibold text-foreground">{project.images_reviewed.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  AI Acceptance: <span className="font-semibold text-foreground">{project.prediction_acceptance_rate.toFixed(1)}%</span>
                </span>
                <span className="text-muted-foreground">
                  Rate: <span className="font-semibold text-foreground">{project.annotations_per_hour?.toFixed(1) || 'N/A'}/hr</span>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
