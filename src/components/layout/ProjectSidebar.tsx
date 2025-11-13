import { FC, ReactNode } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import {
  Upload,
  Pencil,
  BarChart,
  Layers,
  LineChart,
  Images,
  Tags,
  Brain,
  ActivitySquare,
  ChevronRight,
  CircleDot,
  Activity,
} from "lucide-react";

interface Item {
  label: string;
  path: string;
  icon: ReactNode;
  section?: string;
  count?:boolean;
}

const ProjectSideBar: FC = () => {
  const { projectId } = useParams<string>();
  const location = useLocation();
  const { project } = useProject();

  const items: Item[] = [
    // Data Section
    { section: "Data", label: "Upload Data", path: `/projects/${projectId}/upload`, icon: <Upload size={18} /> },
    { section: "Data", label: "Dataset", path: `/projects/${projectId}/dataset`, icon: <Images size={18}/>, count:true  },
    { section: "Data", label: "Annotate", path: `/projects/${projectId}/annotate`, icon: <Pencil size={18} /> },

    // Insights Section
    { section: "Insights", label: "Analysis", path: `/projects/${projectId}/analysis`, icon: <BarChart size={18} /> },
    { section: "Insights", label: "Analytics", path: `/projects/${projectId}/analytics`, icon: <LineChart size={18} /> },
    { section: "Insights", label: "Activity", path: `/projects/${projectId}/activity`, icon: <Activity size={18} /> },

    // Models Section
    { section: "Models", label: "Version", path: `/projects/${projectId}/versions`, icon: <Layers size={18} /> },
    { section: "Models", label: "Models", path: `/projects/${projectId}/models`, icon: <Brain size={18} /> },
    { section: "Models", label: "Training", path: `/projects/${projectId}/sessions`, icon: <ActivitySquare size={18} /> },

    // Settings Section
    { section: "Settings", label: "Classes", path: `/projects/${projectId}/classes`, icon: <Tags size={18} /> },
  ];

  const grouped = items.reduce((acc: Record<string, Item[]>, item) => {
    if (!item.section) return acc;
    acc[item.section] = acc[item.section] ? [...acc[item.section], item] : [item];
    return acc;
  }, {});

  return (
    <aside className="w-48 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-r border-slate-200 shadow-sm flex flex-col h-screen">
      {/* Project Header */}
      <div className="flex flex-col items-center gap-3 p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 to-white backdrop-blur-sm">
        <img
          src={project?.thumbnail_url || "https://placehold.co/48x48?text=P"}
          alt="Project Thumbnail"
          className="w-36 aspect-[16/9] rounded-sm object-cover border border-slate-700 shadow-md brightness-50"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">{project?.name || "Project"}</h2>
          <p className="text-[11px] text-slate-400 truncate">
            {project?.project_type_name || "—"} · {project?.visibility_name || "Private"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {Object.entries(grouped).map(([section, links]) => (
          <div key={section} className="mb-5">
            <h3 className="text-[10px] uppercase tracking-wider text-slate-900 font-medium mb-2 px-2">
              {section}
            </h3>
            <div className="flex flex-col gap-1">
              {links.map(({ label, path, icon, count }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`transition-transform ${isActive ? "scale-110 text-indigo-400" : "text-slate-400 group-hover:text-indigo-300"}`}>
                        {icon}
                      </span>
                      <span className="truncate">{label}</span>
                    </div>

                    {count && project?.statistics?.total_images !== undefined && (
                        <span
                        className={`text-sm font-semibold px-2 py-1 rounded-full transition-colors 
                            ${isActive ? "bg-indigo-500/30" : "bg-indigo-200/30 text-slate-500"}`}
                        >
                        {project.statistics.total_images}
                        </span>
                    )}
    
                    {isActive && <ChevronRight size={14} className="text-indigo-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t">
        <p>© {new Date().getFullYear()} <span className="text-indigo-400 font-semibold">Perceptra Vision</span></p>
      </footer>
    </aside>
  );
};

export default ProjectSideBar;
