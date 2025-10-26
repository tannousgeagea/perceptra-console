
import { Badge } from "@/components/ui/ui/badge";
import { ProjectMembership } from "@/types/membership";
import { mockApi } from "./mockData";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban } from "lucide-react";
import { RoleBadge } from "./RoleBadge";

interface ProjectMembershipBadgeProps {
  membership: ProjectMembership;
}

export function ProjectMembershipBadge({ membership }: ProjectMembershipBadgeProps) {
  const { data: project } = useQuery({
    queryKey: ['project', membership.projectId],
    queryFn: () => mockApi.getOrganization(membership.projectId),
    enabled: !!membership.projectId,
  });

  if (!project) {
    return null;
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1.5 py-1.5">
      <FolderKanban className="h-3.5 w-3.5" />
      <span>{project.name}</span>
      <RoleBadge role={membership.role} className="ml-1" />
    </Badge>
  );
}