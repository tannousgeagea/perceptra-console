
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/ui/card";
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  children, 
  className,
  icon: Icon
}) => {
  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="px-4 py-3">
        <CardTitle className="card-title">
          {Icon && <Icon className="h-5 w-5 text-dashboard-blue" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;