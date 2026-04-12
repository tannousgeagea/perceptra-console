import { Building2, Users, Activity, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface OrgSectionProps {
  organization: { id: string; name: string };
  isExpanded: boolean;
}

export const OrganizationSection = ({ organization, isExpanded }: OrgSectionProps) => {
  return (
    <div className="px-2 pt-2 pb-4">
      {/* Section title */}
      {isExpanded && (
        <h4 className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide
          text-slate-500 dark:text-slate-400">
          Organization
        </h4>
      )}

      {/* Org name */}
      <div className={cn(
        "w-full rounded-md transition-all duration-300 gap-1",
        isExpanded ? "px-2 py-1" : "flex justify-center"
      )}>
        <Link
          to={`/organizations/${organization.id}`}
          className={cn(
            "flex items-center p-2 text-sm font-medium rounded-md transition-colors",
            isExpanded ? "gap-2" : "justify-center",
            "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            "dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          )}
        >
          <Building2 size={18} />
          {isExpanded && (
            <span className="truncate max-w-[120px]">{organization.name}</span>
          )}
        </Link>
      </div>

      {/* Organization Members */}
      <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
        <Link
          to={`/organizations/${organization.id}/members`}
          className={cn(
            "flex items-center p-2 text-sm font-medium rounded-md transition-colors",
            isExpanded ? "gap-2" : "justify-center",
            "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            "dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          )}
        >
          <Users size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Members</span>}
        </Link>
      </div>

      <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
        <Link
          to={`/activity`}
          className={cn(
            "flex items-center p-2 text-sm font-medium rounded-md transition-colors",
            isExpanded ? "gap-2" : "justify-center",
            "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            "dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          )}
        >
          <Activity size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Activities</span>}
        </Link>
      </div>
    </div>
  );
};
