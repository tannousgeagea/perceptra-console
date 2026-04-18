import { Building2, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";

interface OrgSectionProps {
  organization: { id: string; name: string };
  isExpanded: boolean;
}

const linkCls = (isExpanded: boolean) =>
  cn(
    "flex items-center p-2 text-sm font-medium rounded-md transition-colors",
    isExpanded ? "gap-2" : "justify-center",
    "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    "dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
  );

export const OrganizationSection = ({ organization, isExpanded }: OrgSectionProps) => {
  const { isOwner, isAdmin } = useCurrentOrganization();
  const isAdminOrOwner = isOwner || isAdmin;

  return (
    <div className="px-2 pt-2 pb-4">
      {isExpanded && (
        <h4 className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Organization
        </h4>
      )}

      {/* Org overview — admin/owner only */}
      {isAdminOrOwner && (
        <div className={cn("w-full rounded-md transition-all duration-300", isExpanded ? "px-2 py-1" : "flex justify-center")}>
          <Link to={`/organizations/${organization.id}`} className={linkCls(isExpanded)}>
            <Building2 size={18} />
            {isExpanded && <span className="truncate max-w-[120px]">{organization.name}</span>}
          </Link>
        </div>
      )}

      {/* Members — admin/owner only */}
      {isAdminOrOwner && (
        <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
          <Link to={`/organizations/${organization.id}/members`} className={linkCls(isExpanded)}>
            <Users size={18} />
            {isExpanded && <span className="truncate max-w-[120px]">Members</span>}
          </Link>
        </div>
      )}

      {/* Activity — visible to all roles */}
      <div className={cn("w-full", isExpanded ? "px-2" : "flex justify-center")}>
        <Link to="/activity" className={linkCls(isExpanded)}>
          <Activity size={18} />
          {isExpanded && <span className="truncate max-w-[120px]">Activities</span>}
        </Link>
      </div>
    </div>
  );
};
