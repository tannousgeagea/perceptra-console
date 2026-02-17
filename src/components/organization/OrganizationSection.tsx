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
        <h4 className="text-xs font-semibold uppercase text-white/60 px-2 mb-1 tracking-wide">
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
            "flex items-center text-sm font-medium text-white hover:opacity-80 p-2",
            isExpanded ? "gap-2" : "justify-center"
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
            "flex items-center text-sm font-medium text-white hover:opacity-80 p-2",
            isExpanded ? "gap-2" : "justify-center"
          )}
        >
          <Users size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Members</span>}
        </Link>
      </div>

      {/* <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
        <Link
          to={`/organizations/${organization.id}/progress`}
          className={cn(
            "flex items-center text-sm font-medium text-white hover:opacity-80 p-2",
            isExpanded ? "gap-2" : "justify-center"
          )}
        >
          <CircleDashed size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Progress</span>}
        </Link>
      </div> */}

      <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
        <Link
          to={`/activity`}
          className={cn(
            "flex items-center text-sm font-medium text-white hover:opacity-80 p-2",
            isExpanded ? "gap-2" : "justify-center"
          )}
        >
          <Activity size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Activities</span>}
        </Link>
      </div>
    </div>
  );
};
