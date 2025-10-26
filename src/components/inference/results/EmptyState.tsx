import React from 'react';
import { Eye } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <Eye className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">No results yet</h3>
        <p className="text-sm">Upload a file and run inference to see results here</p>
      </div>
    </div>
  );
};