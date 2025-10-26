import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { UserAnalytics, UserImageAnalytics, ChartDataPoint } from "@/types/analytics";
import { format, parseISO } from "date-fns";

interface PerformanceChartsProps {
  jobData: UserAnalytics[];
  imageData: UserImageAnalytics[];
  timeFrame: 'day' | 'week' | 'month';
  isLoading?: boolean;
  selectedUsers?: string[];
  showTopPerformersOnly?: boolean;
}

export const PerformanceCharts = ({ jobData, imageData, timeFrame, isLoading, selectedUsers, showTopPerformersOnly }: PerformanceChartsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="col-span-1">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Transform job data for charts
  const transformJobDataForChart = (metricKey: keyof Pick<UserAnalytics, 'annotatedCount' | 'reviewedCount' | 'completedCount'>) => {
    const dateGroups = jobData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][entry.userName] = entry[metricKey];
      return acc;
    }, {} as Record<string, ChartDataPoint>);

    return Object.values(dateGroups).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).map(item => ({
      ...item,
      date: format(parseISO(item.date), timeFrame === 'day' ? 'MMM dd' : timeFrame === 'week' ? 'MMM dd' : 'MMM yyyy')
    }));
  };

  // Transform image data for charts
  const transformImageDataForChart = (metricKey: keyof Pick<UserImageAnalytics, 'annotatedImages' | 'reviewedImages' | 'finalizedImages'>) => {
    const dateGroups = imageData.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][entry.userName] = entry[metricKey];
      return acc;
    }, {} as Record<string, ChartDataPoint>);

    return Object.values(dateGroups).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).map(item => ({
      ...item,
      date: format(parseISO(item.date), timeFrame === 'day' ? 'MMM dd' : timeFrame === 'week' ? 'MMM dd' : 'MMM yyyy')
    }));
  };

  const annotationData = transformJobDataForChart('annotatedCount');
  const reviewData = transformJobDataForChart('reviewedCount');
  const completionData = transformJobDataForChart('completedCount');

  const annotatedImagesData = transformImageDataForChart('annotatedImages');
  const reviewedImagesData = transformImageDataForChart('reviewedImages');
  const finalizedImagesData = transformImageDataForChart('finalizedImages');

  // Get unique users and filter based on selection and top performers
  let allUsers = [...new Set(jobData.map(entry => entry.userName))];
  
  // Filter by selected users if any
  if (selectedUsers && selectedUsers.length > 0) {
    allUsers = allUsers.filter(user => selectedUsers.includes(user));
  }
  
  // Filter by top performers if enabled
  if (showTopPerformersOnly) {
    const userTotals = jobData.reduce((acc, entry) => {
      if (!acc[entry.userName]) {
        acc[entry.userName] = 0;
      }
      acc[entry.userName] += entry.annotatedCount + entry.reviewedCount + entry.completedCount;
      return acc;
    }, {} as Record<string, number>);
    
    allUsers = allUsers
      .sort((a, b) => userTotals[b] - userTotals[a])
      .slice(0, 5);
  }
  
  const users = allUsers;
  
  // Generate more colors for better visualization
  const userColors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    'hsl(220, 70%, 50%)',   // Blue
    'hsl(140, 70%, 45%)',   // Green
    'hsl(280, 70%, 55%)',   // Purple
    'hsl(30, 80%, 55%)',    // Orange
    'hsl(350, 70%, 55%)',   // Red
    'hsl(190, 70%, 50%)',   // Cyan
    'hsl(60, 70%, 50%)',    // Yellow
    'hsl(160, 60%, 45%)',   // Teal
    'hsl(320, 65%, 55%)',   // Magenta
  ];

  const chartConfig = users.reduce((acc, user, index) => {
    acc[user] = {
      label: user,
      color: userColors[index % userColors.length],
    };
    return acc;
  }, {} as any);

  return (
    <div className="space-y-6">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">Job-Level Performance</h3>
        <p className="text-sm text-muted-foreground">Track team productivity by jobs</p>
      </div>
  
      {/* Annotations Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Annotated</CardTitle>
            <CardDescription>
              Jobs in annotation per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={annotationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Bar
                    key={userName}
                    dataKey={userName}
                    fill={userColors[index % userColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Reviewed</CardTitle>
            <CardDescription>
              Jobs in review per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={reviewData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Bar
                    key={userName}
                    dataKey={userName}
                    fill={userColors[index % userColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jobs Completed</CardTitle>
            <CardDescription>
              Jobs finished per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Bar
                    key={userName}
                    dataKey={userName}
                    fill={userColors[index % userColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-1">Image-Level Performance</h3>
        <p className="text-sm text-muted-foreground">Track team productivity by images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images Annotated</CardTitle>
            <CardDescription>
              Images annotated per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={annotatedImagesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Line
                    key={userName}
                    type="monotone"
                    dataKey={userName}
                    stroke={userColors[index % userColors.length]}
                    strokeWidth={2}
                    dot={{ fill: userColors[index % userColors.length], r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images Reviewed</CardTitle>
            <CardDescription>
              Images in review per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={reviewedImagesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Line
                    key={userName}
                    type="monotone"
                    dataKey={userName}
                    stroke={userColors[index % userColors.length]}
                    strokeWidth={2}
                    dot={{ fill: userColors[index % userColors.length], r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images Finalized</CardTitle>
            <CardDescription>
              Images fully finalized per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={finalizedImagesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {users.map((userName, index) => (
                  <Line
                    key={userName}
                    type="monotone"
                    dataKey={userName}
                    stroke={userColors[index % userColors.length]}
                    strokeWidth={2}
                    dot={{ fill: userColors[index % userColors.length], r: 3 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};