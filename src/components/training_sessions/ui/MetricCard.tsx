import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, suffix = '' }) => {
  const formattedValue = suffix === '%' ? (value * 100).toFixed(1) : value.toFixed(2);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-semibold mt-1">
        {formattedValue}
        {suffix}
      </p>
    </div>
  );
};

export default MetricCard;