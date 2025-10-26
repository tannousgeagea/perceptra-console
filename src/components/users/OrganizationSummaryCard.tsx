
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Organization } from "@/types/membership";
import { Building2, FolderKanban, Users } from "lucide-react";

interface OrganizationSummaryCardProps {
  organization: Organization;
}

export function OrganizationSummaryCard({ organization }: OrganizationSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          {organization.name}
        </CardTitle>
        <CardDescription>Organization summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium leading-none">{organization.userCount}</p>
              <p className="text-sm text-muted-foreground">Users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium leading-none">{organization.projectCount}</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}