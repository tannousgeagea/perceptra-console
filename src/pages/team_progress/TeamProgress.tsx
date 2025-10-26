import { FC } from "react";
import { useParams } from "react-router-dom";
import TeamAnalyticsSection from "@/components/team-analytics/TeamAnalyticsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import UserProgressSection from "@/components/jobs/UserProgressSection";

const TeamProgress: FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const handleUserClick = (userId: string) => {
    console.log(`Navigating to user detail page: ${userId}`);
    // In a real app, you'd navigate to the user detail page:
    // navigate(`/users/${userId}`);
  };

    return (
      <main className="space-y-6 p-8 w-full">
        <Tabs defaultValue="team-progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="team-progress">Team Progress</TabsTrigger>
            <TabsTrigger value="team-analytics">Team Analytics</TabsTrigger>
          </TabsList>
                        
          <TabsContent value="team-progress">
            <UserProgressSection orgId={orgId || ""} onUserClick={handleUserClick} />
          </TabsContent>
          
          <TabsContent value="team-analytics">
            <TeamAnalyticsSection />
          </TabsContent>
        </Tabs>
      </main>
    )
}

export default TeamProgress