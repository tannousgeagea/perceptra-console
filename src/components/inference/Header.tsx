
import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Moon, Sun, GitCompare } from 'lucide-react';
import { Switch } from '@/components/ui/ui/switch';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  isComparisonMode,
  setIsComparisonMode
}) => {
  return (
    <header className="min-h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="h-full min-h-16 px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inference
          </h1>

          <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <div className="flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Comparison Mode
            </span>
            <Switch
              checked={isComparisonMode}
              onCheckedChange={setIsComparisonMode}
            />
          </div>
        </div>

        {/* <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 p-0"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div> */}
      </div>
    </header>
  );
};