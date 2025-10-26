import { FC } from "react";
import { parseISO, formatDistanceToNow } from "date-fns";
import { ProjectThumbnail } from "./ProjectThumbnail";
import { Project } from "@/types/project";

interface ProjectCardProps {
    project: Project;
    onView: (name: string) => void;
}

const formatEditedTime = (isoDateString: string): string => {
    const date = parseISO(isoDateString);
    return `Edited ${formatDistanceToNow(date, { addSuffix: true })}`;
};

const ProjectCard: FC<ProjectCardProps> = ({ project, onView }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Thumbnail */}
      <div className="h-40 w-full overflow-hidden rounded-t-lg">
        <ProjectThumbnail
          thumbnail={project.thumbnail_url}
          projectName={project.name}
          projectType={'object-detection'}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Header */}
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {project.project_type_name}
          </span>
          <span className="text-xs">🔒</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-800 truncate">
          {project.name}
        </h3>

        {/* Meta */}
        <p className="text-xs text-slate-400">{formatEditedTime(project.last_edited)}</p>

        {/* Details */}
        <p className="text-xs text-slate-500">
          {project.visibility_name} • {project.statistics.total_images} Images • 0 Models
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end p-2 border-t border-slate-100">
        <button
          onClick={() => onView(project.project_id)}
          className="text-slate-500 hover:text-slate-700 transition-colors text-xl"
          aria-label="View project"
        >
          •••
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;