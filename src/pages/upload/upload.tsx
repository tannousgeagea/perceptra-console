
import React from 'react';
import { FileUploader } from '@/components/upload/FileUploader';
import { ImageGrid } from '@/components/upload/ImageGrid';
import Header from '@/components/ui/header/Header';
import { useProject } from '@/contexts/ProjectContext';

export const UploadPage: React.FC = () => {
  const { project } = useProject();

  console.log(project)
  return (
    <div className="space-y-6 p-6 w-full">      
      <Header
        title="Upload Images"
        description={`Add images to ${project?.name}. Uploaded images will be automatically associated with this project.`}
      />
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Select Images</h2>
          <FileUploader />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <ImageGrid />
        </div>
      </div>
    </div>
  );
};