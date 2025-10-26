import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Users, TrendingUp, Search, ArrowUpDown, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Progress } from "@/components/ui/ui/progress";
import { Input } from "@/components/ui/ui/input";
import { Button } from "@/components/ui/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/ui/avatar";
import { Badge } from "@/components/ui/ui/badge";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { useUserProgress, useProgressSummary } from "@/hooks/useUserProgress";
import { UserProgress } from "@/types/progress";


interface ProgressSummaryCardsProps {
  orgId: string;
}

interface UserProgressSectionProps {
  orgId: string;
  onUserClick?: (userId: string) => void;
}

const UserProgressCard = ({ 
  userProgress, 
  onUserClick 
}: { 
  userProgress: UserProgress;
  onUserClick?: (userId: string) => void;
}) => {
  const handleClick = () => {
    if (onUserClick) {
      onUserClick(userProgress.userId);
    } else {
      console.log(`Navigating to user detail: ${userProgress.userId}`);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProgress.avatarUrl} alt={userProgress.userName} />
              <AvatarFallback>{getInitials(userProgress.userName)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{userProgress.userName}</h4>
              <p className="text-xs text-muted-foreground">{userProgress.userRole}</p>
            </div>
          </div>
          <Badge variant="outline" className={getProgressColor(userProgress.progressPercentage)}>
            {userProgress.progressPercentage.toFixed(1)}%
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{userProgress.completedImages} / {userProgress.totalImages} images</span>
          </div>
          <Progress value={userProgress.progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-blue-600">{userProgress.annotatedImages}</div>
            <div className="text-muted-foreground">Annotated</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">{userProgress.reviewedImages}</div>
            <div className="text-muted-foreground">Reviewed</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">{userProgress.completedImages}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
          <Clock size={12} />
          <span>Updated {formatDistanceToNow(userProgress.lastUpdated, { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressSummaryCards = ({
  orgId
} : {
  orgId: string;
}) => {
  const { data: summary, isLoading } = useProgressSummary(orgId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <div className="text-2xl font-bold">{summary.totalActiveUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Avg Progress</span>
          </div>
          <div className="text-2xl font-bold">{summary.averageProgress.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className="text-2xl font-bold">{summary.totalImagesInProgress.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-2xl font-bold">{summary.totalImagesCompleted.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full mb-2" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const UserProgressSection = ({ orgId, onUserClick }: UserProgressSectionProps) => {
  const { data: userProgress, isLoading, error } = useUserProgress(orgId);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedUsers = userProgress
    ?.filter(user => 
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userRole.toLowerCase().includes(searchQuery.toLowerCase())
    )
    ?.sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      return (a.progressPercentage - b.progressPercentage) * multiplier;
    }) || [];

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">User Progress Overview</h2>
            <p className="text-slate-500">Track progress across all active users</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={toggleSortOrder}
              className="flex items-center gap-2"
            >
              <ArrowUpDown size={16} />
              {sortOrder === 'desc' ? 'High→Low' : 'Low→High'}
            </Button>
          </div>
        </div>

        <ProgressSummaryCards orgId={orgId}/>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-red-600">Failed to load user progress data</p>
            </CardContent>
          </Card>
        ) : filteredAndSortedUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-sm mb-1">No users found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'No active users with assigned jobs.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedUsers.map((user) => (
              <UserProgressCard
                key={user.userId}
                userProgress={user}
                onUserClick={onUserClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProgressSection;