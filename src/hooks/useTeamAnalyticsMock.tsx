import { useQuery } from "@tanstack/react-query";
import { UserAnalytics, AnalyticsKPIs, AnalyticsFilters } from "@/types/analytics";
import { subDays, subWeeks, subMonths, format, startOfDay } from "date-fns";

// Mock analytics data generation
const generateMockAnalytics = (filters: AnalyticsFilters): UserAnalytics[] => {
  const users = [
    { id: "user-1", name: "Alice Johnson", role: "Senior Annotator" },
    { id: "user-2", name: "Bob Smith", role: "Annotator" },
    { id: "user-3", name: "Carol Davis", role: "Lead Reviewer" },
    { id: "user-4", name: "David Wilson", role: "Junior Annotator" },
    { id: "user-5", name: "Emma Brown", role: "Senior Annotator" },
    { id: "user-6", name: "Frank Miller", role: "Annotator" },
    { id: "user-7", name: "Grace Lee", role: "Lead Reviewer" },
    { id: "user-8", name: "Henry Taylor", role: "Junior Annotator" },
    { id: "user-9", name: "Ivy Chen", role: "Senior Annotator" },
    { id: "user-10", name: "Jack Rodriguez", role: "Annotator" },
    { id: "user-11", name: "Kate Williams", role: "Lead Reviewer" },
    { id: "user-12", name: "Luke Anderson", role: "Junior Annotator" },
    { id: "user-13", name: "Maya Patel", role: "Senior Annotator" },
    { id: "user-14", name: "Noah Garcia", role: "Annotator" },
    { id: "user-15", name: "Olivia Martinez", role: "Lead Reviewer" },
  ];

  const data: UserAnalytics[] = [];
  const today = new Date();
  
  // Generate date range based on timeframe
  let dates: Date[] = [];
  const { timeFrame } = filters;
  
  if (timeFrame === 'day') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      dates.push(subDays(today, i));
    }
  } else if (timeFrame === 'week') {
    // Last 6 weeks
    for (let i = 5; i >= 0; i--) {
      dates.push(subWeeks(today, i));
    }
  } else if (timeFrame === 'month') {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      dates.push(subMonths(today, i));
    }
  }

  // Generate data for each user and date
  users.forEach(user => {
    // Skip if role filter is applied and doesn't match
    if (filters.role && user.role !== filters.role) return;
    
    dates.forEach(date => {
      // Generate realistic numbers based on role
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseMultiplier = isWeekend ? 0.3 : 1;
      
      let annotatedBase = 20;
      let reviewedBase = 15;
      let completedBase = 10;
      
      if (user.role.includes('Senior')) {
        annotatedBase = 35;
        reviewedBase = 25;
        completedBase = 18;
      } else if (user.role.includes('Lead')) {
        annotatedBase = 15;
        reviewedBase = 40;
        completedBase = 25;
      } else if (user.role.includes('Junior')) {
        annotatedBase = 12;
        reviewedBase = 8;
        completedBase = 5;
      }
      
      const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      
      data.push({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        date: format(startOfDay(date), 'yyyy-MM-dd'),
        annotatedCount: Math.round(annotatedBase * baseMultiplier * randomFactor),
        reviewedCount: Math.round(reviewedBase * baseMultiplier * randomFactor),
        completedCount: Math.round(completedBase * baseMultiplier * randomFactor),
        totalTime: Math.round(120 + Math.random() * 240), // 2-6 hours
      });
    });
  });

  return data;
};

const calculateKPIs = (analyticsData: UserAnalytics[]): AnalyticsKPIs => {
  const today = new Date();
  const weekAgo = subDays(today, 7);
  
  // Filter data for this week
  const thisWeekData = analyticsData.filter(entry => 
    new Date(entry.date) >= weekAgo
  );
  
  const totalAnnotationsThisWeek = thisWeekData.reduce(
    (sum, entry) => sum + entry.annotatedCount, 0
  );
  
  const totalReviewsThisWeek = thisWeekData.reduce(
    (sum, entry) => sum + entry.reviewedCount, 0
  );
  
  const totalCompletionsThisWeek = thisWeekData.reduce(
    (sum, entry) => sum + entry.completedCount, 0
  );
  
  // Calculate top performer (by total activity)
  const userTotals = analyticsData.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = {
        name: entry.userName,
        total: 0
      };
    }
    acc[entry.userId].total += entry.annotatedCount + entry.reviewedCount + entry.completedCount;
    return acc;
  }, {} as Record<string, { name: string; total: number }>);
  
  const topPerformerEntry = Object.entries(userTotals).reduce(
    (max, [userId, data]) => data.total > max.score 
      ? { userId, userName: data.name, score: data.total }
      : max,
    { userId: '', userName: '', score: 0 }
  );
  
  const averageCompletionTimeMinutes = thisWeekData.length > 0
    ? thisWeekData.reduce((sum, entry) => sum + (entry.totalTime || 0), 0) / thisWeekData.length
    : 0;
  
  return {
    totalAnnotationsThisWeek,
    totalReviewsThisWeek,
    totalCompletionsThisWeek,
    topPerformer: topPerformerEntry,
    averageCompletionTimeMinutes: Math.round(averageCompletionTimeMinutes),
  };
};

export const useTeamAnalytics = (filters: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analyticsData = generateMockAnalytics(filters);
      const kpis = calculateKPIs(analyticsData);
      
      return {
        data: analyticsData,
        kpis,
      };
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });
};