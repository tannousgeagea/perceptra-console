
import React from 'react';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <aside className="w-full md:w-80 md:shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm md:overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-6">
        {children}
      </div>
    </aside>
  );
};