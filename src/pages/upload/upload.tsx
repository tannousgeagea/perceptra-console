
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileUploader } from '@/components/upload/FileUploader';
import { ImageGrid } from '@/components/upload/ImageGrid';
import Header from '@/components/ui/header/Header';
import { TagInput } from '@/components/upload/TagInput';

export const UploadPage: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const { projectId } = useParams<{ projectId: string }>();

  const description = projectId
    ? "Add images. Uploaded images will be automatically associated with this project."
    : "Add images to your organization’s data lake. You can later assign them to projects.";


  return (
    <div className="space-y-6 p-6 w-full">      
      <Header
        title="Upload Images"
        description={description}
      />
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-lg font-semibold">Select Images</h2>
          <FileUploader />

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">
              Add Tags (optional)
            </h3>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <ImageGrid tags={tags} />
        </div>
      </div>
    </div>
  );
}; 