
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, className }) => {
  return (
    <div className={`p-4 rounded-lg border bg-white shadow-sm ${className}`}>
      <p className="stat-label">{label}</p>
      <div className="flex items-baseline justify-between mt-1">
        <h3 className="stat-value">{value}</h3>
        {change && (
          <span className={`text-sm ml-2 ${change.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
