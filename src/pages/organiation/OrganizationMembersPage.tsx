
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { mockApi, projects } from "@/components/users/mockData";
import { UserTable } from "@/components/users/UserTable";
import { EmptyState } from "@/components/users/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { InviteUserModal } from "@/components/users/InviteUserModal";
import { ProjectMember, Role } from "@/types/membership";
import { Badge } from "@/components/ui/ui/badge";
import { getUserOrganization, getOrganizationMembers, getOrgProjects } from "@/components/users/api";

export default function OrganizationMembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const org = await getUserOrganization();
      return org;
    },
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['organization-members', orgId],
    queryFn: () => getOrganizationMembers(orgId!),
    enabled: !!orgId,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects', orgId],
    queryFn: () => getOrgProjects(orgId!),
    enabled: !!orgId,
  });


  if (isLoadingOrg || isLoadingMembers) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 w-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-700 text-sm">Loading organization members...</div>
      </div>
    );
  }

  if (!organization || !members) {
    return <Navigate to="/no-permission" replace />;
  }

  const filteredMembers = members.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Transform organization members to project members format for UserTable component
  const usersForTable: ProjectMember[] = filteredMembers.map(member => ({
    ...member,
  }));

  const handleRemoveUser = (userId: string) => {
    toast({
      title: "User removed",
      description: "User has been removed from the organization.",
    });
  };

  const handleInviteUser = async (email: string, role: Role) => {
    toast({
      title: "User invited",
      description: `Invitation sent to ${email} with ${role} role.`,
    });
    return Promise.resolve();
  };

  return (
    <div className="space-y-6 animate-fade-in w-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{organization.name} Members</h1>
          <p className="text-muted-foreground">Manage all users in this organization</p>
        </div>
        <InviteUserModal onInvite={handleInviteUser} />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {projectsData?.map(project => (
          <Badge key={project.id} variant="outline" className="py-1">
            {project.name} ({project.memberCount})
          </Badge>
        ))}
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <EmptyState
              title="No members found"
              description={searchTerm ? "Try a different search term" : "This organization doesn't have any members yet"}
              actionLabel={searchTerm ? "Clear search" : "Invite members"}
              onAction={() => searchTerm ? setSearchTerm("") : null}
            />
          ) : (
            <UserTable
              users={usersForTable}
              onRemoveUser={handleRemoveUser}
              showRoleDropdown={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}