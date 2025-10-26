
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mockApi, projects } from "@/components/users/mockData";
import { UserTable } from "@/components/users/UserTable";
import { Button } from "@/components/ui/ui/button";
import { EmptyState } from "@/components/users/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { InviteUserModal } from "@/components/users/InviteUserModal";
import { Role } from "@/types/membership";

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => Promise.resolve(projects.find(p => p.id === projectId)),
    enabled: !!projectId,
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => mockApi.getProjectMembers(projectId!),
    enabled: !!projectId,
  });

  if (isLoadingMembers) {
    return <div className="flex items-center justify-center h-64">Loading project members...</div>;
  }

  if (!project || !members) {
    return <div>Project not found</div>;
  }

  const filteredMembers = members.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveUser = (userId: string) => {
    toast({
      title: "User removed",
      description: "User has been removed from the project.",
    });
  };

  const handleRoleChange = (userId: string, role: Role) => {
    toast({
      title: "Role updated",
      description: `User role has been updated to ${role}.`,
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
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Manage members and their roles</p>
        </div>
        <InviteUserModal onInvite={handleInviteUser} />
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project Members</CardTitle>
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
              description={searchTerm ? "Try a different search term" : "This project doesn't have any members yet"}
              actionLabel={searchTerm ? "Clear search" : "Invite members"}
              onAction={() => searchTerm ? setSearchTerm("") : null}
            />
          ) : (
            <UserTable
              users={filteredMembers}
              onRoleChange={handleRoleChange}
              onRemoveUser={handleRemoveUser}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}