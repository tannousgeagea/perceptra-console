import { FC } from "react";
import { ShieldAlert } from "lucide-react";
import { useCurrentOrganization } from "@/hooks/useAuthHelpers";
import TeamAnalyticsSection from "@/components/team-analytics/TeamAnalyticsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import UserProgressSection from "@/components/jobs/UserProgressSection";

/** Team page: per-member job progress and activity analytics for the current organization (admins and owners). */
const TeamProgress: FC = () => {
  const { currentOrganization, hasAdminPermission } = useCurrentOrganization();
  const orgId = currentOrganization?.id;

  if (currentOrganization && !hasAdminPermission) {
    return (
      <main className="flex w-full flex-1 items-center justify-center p-8">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Admins only</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Team progress and analytics for {currentOrganization.name} are visible to organization admins and owners.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Progress and activity of everyone assigned to jobs in {currentOrganization?.name ?? "this organization"}.
        </p>
      </div>
      <Tabs defaultValue="team-progress" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="team-progress">Team Progress</TabsTrigger>
          <TabsTrigger value="team-analytics">Team Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="team-progress">
          <UserProgressSection orgId={orgId || ""} onUserClick={() => undefined} />
        </TabsContent>

        <TabsContent value="team-analytics">
          <TeamAnalyticsSection />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default TeamProgress;
