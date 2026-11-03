import { FC } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { CopyableId } from "@/components/ui/ui/copyable-id";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/ui/tooltip";
import { ChevronRight } from "lucide-react";
import { projectNavItems, type ProjectNavItem } from "./projectNav";


const ProjectSideBar: FC = () => {
  const { projectId } = useParams<string>();
  const location = useLocation();
  const { project } = useProject();

  const items = projectNavItems(projectId ?? "");

  const grouped = items.reduce((acc: Record<string, ProjectNavItem[]>, item) => {
    if (!item.section) return acc;
    acc[item.section] = acc[item.section] ? [...acc[item.section], item] : [item];
    return acc;
  }, {});

  return (
    <aside className="w-48 flex flex-col h-screen
      bg-gradient-to-b from-white via-slate-50 to-slate-100
      dark:from-slate-900 dark:via-slate-900 dark:to-slate-950
      border-r border-slate-200 dark:border-slate-800
      shadow-sm dark:shadow-none">

      {/* Project Header */}
      <div className="flex flex-col items-center gap-3 p-4
        border-b border-slate-200 dark:border-slate-800
        bg-gradient-to-r from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-slate-900
        backdrop-blur-sm">
        <img
          src={project?.thumbnail_url || "https://placehold.co/48x48?text=P"}
          alt="Project Thumbnail"
          className="w-36 aspect-[16/9] rounded-sm object-cover border border-slate-700 shadow-md brightness-50"
        />
        {/* w-full keeps long names inside the sidebar; without it the block
            sizes to its content and centring clips both ends. */}
        <div className="w-full min-w-0 space-y-0.5 text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <h2 className="text-sm font-semibold leading-snug line-clamp-2 break-words text-slate-800 dark:text-slate-100">
                {project?.name || "Project"}
              </h2>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs break-words">
              {project?.name || "Project"}
            </TooltipContent>
          </Tooltip>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {project?.project_type_name || "—"} · {project?.visibility_name || "Private"}
          </p>
          {projectId && (
            <CopyableId
              value={projectId}
              label="Project ID"
              prefix="ID"
              truncate={8}
              className="mx-auto text-[11px] text-slate-400 dark:text-slate-500"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3
        scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent
        dark:scrollbar-thumb-slate-700 dark:scrollbar-track-slate-900">
        {Object.entries(grouped).map(([section, links]) => (
          <div key={section} className="mb-5">
            <h3 className="text-[10px] uppercase tracking-wider font-medium mb-2 px-2
              text-slate-400 dark:text-slate-500">
              {section}
            </h3>
            <div className="flex flex-col gap-1">
              {links.map(({ label, path, icon: Icon, count }) => {
                const isActive = location.pathname.startsWith(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:from-indigo-900/40 dark:to-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`transition-transform
                        ${isActive
                          ? "scale-110 text-indigo-500 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 dark:group-hover:text-indigo-400"
                        }`}>
                        <Icon size={18} />
                      </span>
                      <span className="truncate">{label}</span>
                    </div>

                    {count && project?.statistics?.total_images !== undefined && (
                      <span
                        className={`text-sm font-semibold px-2 py-1 rounded-full transition-colors
                          ${isActive
                            ? "bg-indigo-500/30 dark:bg-indigo-400/20"
                            : "bg-indigo-200/30 text-slate-500 dark:bg-indigo-900/30 dark:text-slate-400"
                          }`}
                      >
                        {project.statistics.total_images}
                      </span>
                    )}

                    {isActive && <ChevronRight size={14} className="text-indigo-400 dark:text-indigo-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] border-t
        text-slate-400 dark:text-slate-600
        border-slate-200 dark:border-slate-800">
        <p>© {new Date().getFullYear()} <span className="text-indigo-400 dark:text-indigo-500 font-semibold">Malumetrix</span></p>
      </footer>
    </aside>
  );
};

export default ProjectSideBar;
