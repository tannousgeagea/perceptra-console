import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProgressBarProps {
  percentage: number;
  status: string;
  message?:string;
  variant?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  isComplete?: boolean;
  title?: string;
}


export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  status,
  message,
  variant = 'bar',
  size = 'md',
  error,
  isComplete,
  title
}) => {
  const sizeClasses = {
    sm: 'h-2 text-sm',
    md: 'h-4 text-base',
    lg: 'h-6 text-lg'
  };

  const getBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-amber-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-blue-500';
    }
  };


  const barColor = getBarColor()
  if (variant === 'circle') {
    return (
      <div className="flex flex-col items-center">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <div className="relative w-32 h-32 transform -rotate-90">
          <svg 
            className="w-full h-full"
            viewBox="0 0 120 120"
            >
            <circle
              className="text-gray-200"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="60"
              cy="60"
            />
            <motion.circle
              className="text-blue-600"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="60"
              cy="60"
              initial={{ strokeDashoffset: 283 }}
              animate={{
                strokeDashoffset: 283 - (283 * percentage) / 100
              }}
              style={{
                strokeDasharray: 283
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center transform rotate-90">
            {error ? (
              <AlertCircle className="h-8 w-8 text-red-500" />
            ) : isComplete ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <span className="text-xl font-semibold">{percentage}%</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-gray-600">{status}</p>
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div className="relative">
        <div
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
        >
          <motion.div
            className={`${barColor} h-full rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-gray-600">{status}: {message}</span>
          <div className="flex items-center">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            ) : isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
            )}
            <span className="font-semibold">{percentage}%</span>
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 mt-1">{error}</p>}
    </div>
  );
};