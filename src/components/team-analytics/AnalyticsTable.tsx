import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { Button } from "@/components/ui/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/ui/table";
import { Badge } from "@/components/ui/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/ui/tabs";
import { Download, ArrowUpDown } from "lucide-react";
import { UserAnalytics, UserImageAnalytics } from "@/types/analytics";
import { format } from "date-fns";

interface AnalyticsTableProps {
  jobData: UserAnalytics[];
  imageData: UserImageAnalytics[];
  timeFrame: 'day' | 'week' | 'month';
  isLoading?: boolean;
}

type JobSortField = 'userName' | 'annotatedCount' | 'reviewedCount' | 'completedCount' | 'totalTime';
type ImageSortField = 'userName' | 'annotatedImages' | 'reviewedImages' | 'finalizedImages' | 'totalImagesWorked';
type SortDirection = 'asc' | 'desc';

export const AnalyticsTable = ({ jobData, imageData, timeFrame, isLoading }: AnalyticsTableProps) => {
  const [jobSortField, setJobSortField] = useState<JobSortField>('annotatedCount');
  const [imageSortField, setImageSortField] = useState<ImageSortField>('finalizedImages');  
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Aggregate data by user
  const aggregatedJobData = jobData.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = {
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        annotatedCount: 0,
        reviewedCount: 0,
        completedCount: 0,
        totalTime: 0,
        entries: []
      };
    }
    
    acc[entry.userId].annotatedCount += entry.annotatedCount;
    acc[entry.userId].reviewedCount += entry.reviewedCount;
    acc[entry.userId].completedCount += entry.completedCount;
    acc[entry.userId].totalTime += entry.totalTime || 0;
    acc[entry.userId].entries.push(entry);
    
    return acc;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    userRole: string;
    annotatedCount: number;
    reviewedCount: number;
    completedCount: number;
    totalTime: number;
    entries: UserAnalytics[];
  }>);

  const tableData = Object.values(aggregatedJobData);

  // Aggregate image data by user
  const aggregatedImageData = imageData.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = {
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        annotatedImages: 0,
        reviewedImages: 0,
        finalizedImages: 0,
        totalImagesWorked: 0,
      };
    }
    
    acc[entry.userId].annotatedImages += entry.annotatedImages;
    acc[entry.userId].reviewedImages += entry.reviewedImages;
    acc[entry.userId].finalizedImages += entry.finalizedImages;
    acc[entry.userId].totalImagesWorked += entry.totalImagesWorked;
    
    return acc;
  }, {} as Record<string, {
    userId: string;
    userName: string;
    userRole: string;
    annotatedImages: number;
    reviewedImages: number;
    finalizedImages: number;
    totalImagesWorked: number;
  }>);

  const jobTableData = Object.values(aggregatedJobData);
  const imageTableData = Object.values(aggregatedImageData);

  // Sort job data
  const sortedJobData = [...jobTableData].sort((a, b) => {
    let aValue = a[jobSortField];
    let bValue = b[jobSortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Sort image data
  const sortedImageData = [...imageTableData].sort((a, b) => {
    let aValue = a[imageSortField];
    let bValue = b[imageSortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleJobSort = (field: JobSortField) => {
    if (field === jobSortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setJobSortField(field);
      setSortDirection('desc');
    }
  };

  const handleImageSort = (field: ImageSortField) => {
    if (field === imageSortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setImageSortField(field);
      setSortDirection('desc');
    }
  };

  const exportJobToCSV = () => {
    const headers = ['User Name', 'Role', 'Annotations', 'Reviews', 'Completions', 'Total Time (hrs)'];
    const csvData = [
      headers.join(','),
      ...sortedJobData.map(row => [
        `"${row.userName}"`,
        `"${row.userRole}"`,
        row.annotatedCount,
        row.reviewedCount,
        row.completedCount,
        Math.round(row.totalTime / 60 * 10) / 10
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportImageCSV = () => {
    const headers = ['User Name', 'Role', 'Images Annotated', 'Images Reviewed', 'Images Finalized', 'Total Images Worked'];
    const csvData = [
      headers.join(','),
      ...sortedImageData.map(row => [
        `"${row.userName}"`,
        `"${row.userRole}"`,
        row.annotatedImages,
        row.reviewedImages,
        row.finalizedImages,
        row.totalImagesWorked
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `image-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Job Metrics</TabsTrigger>
            <TabsTrigger value="images">Image Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={exportJobToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleJobSort('userName')}>
                      <div className="flex items-center space-x-1">
                        <span>User</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleJobSort('annotatedCount')}>
                      <div className="flex items-center space-x-1">
                        <span>Annotated</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleJobSort('reviewedCount')}>
                      <div className="flex items-center space-x-1">
                        <span>Reviewed</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleJobSort('completedCount')}>
                      <div className="flex items-center space-x-1">
                        <span>Completed</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleJobSort('totalTime')}>
                      <div className="flex items-center space-x-1">
                        <span>Time</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedJobData.map((row) => (
                    <TableRow key={row.userId} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.userName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {row.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-blue-600">
                        {row.annotatedCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono text-green-600">
                        {row.reviewedCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono text-purple-600">
                        {row.completedCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {Math.round(row.totalTime / 60 * 10) / 10}h
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {sortedJobData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the selected filters
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="images" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={exportImageCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleImageSort('userName')}>
                      <div className="flex items-center space-x-1">
                        <span>User</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleImageSort('annotatedImages')}>
                      <div className="flex items-center space-x-1">
                        <span>Annotated</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleImageSort('reviewedImages')}>
                      <div className="flex items-center space-x-1">
                        <span>Reviewed</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleImageSort('finalizedImages')}>
                      <div className="flex items-center space-x-1">
                        <span>Finalized</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleImageSort('totalImagesWorked')}>
                      <div className="flex items-center space-x-1">
                        <span>Total Worked</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedImageData.map((row) => (
                    <TableRow key={row.userId} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.userName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {row.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-cyan-600">
                        {row.annotatedImages.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono text-indigo-600">
                        {row.reviewedImages.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono text-orange-600">
                        {row.finalizedImages.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center font-mono text-purple-600">
                        {row.totalImagesWorked.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {sortedImageData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No data available for the selected filters
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};