import { FC, ReactNode } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import "./sidebar.css";

import {
  Upload,
  Pencil,
  BarChart,
  Layers,
  LineChart,
  Images,
  Tags,
  Brain,
  ActivitySquare
} from "lucide-react";

interface SideBarProps {}

interface Item {
  item: string;
  ref: string;
  icon: ReactNode;
}

const SideBar: FC<SideBarProps> = () => {
  const { projectId } = useParams<string>();
  const location = useLocation();
  const { project } = useProject()

  const items: Item[] = [
    { item: "Upload Data", ref: `/projects/${projectId}/upload`, icon: <Upload size={20} /> },
    { item: "Annotate", ref: `/projects/${projectId}/annotate`, icon: <Pencil size={20} /> },
    { item: "Analysis", ref: `/projects/${projectId}/analysis`, icon: <BarChart size={20} /> },
    { item: "Dataset", ref: `/projects/${projectId}/dataset`, icon: <Images size={20} /> },
    { item: "Version", ref: `/projects/${projectId}/versions`, icon: <Layers size={20} /> },
    { item: "Analytics", ref: `/projects/${projectId}/analytics`, icon: <LineChart size={20} /> },
    { item: "Classes", ref: `/projects/${projectId}/classes`, icon: <Tags size={20} /> },
    { item: "Models", ref: `/projects/${projectId}/models`, icon: <Brain size={20} /> },
    { item: "Training", ref: `/projects/${projectId}/sessions`, icon: <ActivitySquare size={20} /> },
    
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col h-screen">
      {/* Project Info */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200">
        <img
          src={project?.thumbnail_url || "https://placehold.co/40x40?font=roboto"}
          alt=""
          className="w-12 h-12 rounded object-cover border border-slate-300 shadow-sm"
        />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-700 truncate">{project?.name || "Project"}</h2>
          <p className="text-xs text-slate-400 truncate">ID: {projectId}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-xs uppercase text-slate-400 tracking-wider font-medium">Data</h3>
        {items.map((item, index) => {
          const isActive = location.pathname.includes(item.ref);
          return (
            <Link
              to={item.ref}
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors 
                ${isActive 
                  ? "bg-accent text-white" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.item}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;