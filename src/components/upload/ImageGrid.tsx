
import React from 'react';
import { useUploadContext } from '@/contexts/UploadContext';
import ImageCard from './ImageCard/ImageCard';
import { Button } from '@/components/ui/ui/button';
import { Upload, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const ImageGrid: React.FC = () => {
  const { removeImage } = useUploadContext();
  const { uploadedImages, submitUpload, isUploading } = useUploadContext();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string | '' }>();

  if (uploadedImages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No images selected</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Upload images to see them here. You can drag & drop files or select them manually.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
        {uploadedImages.map(image => (
          <ImageCard key={image.id} file={image} onRemove={removeImage} />
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} selected
        </div>
        
        <Button
          onClick={() => {
            if (!projectId) {
              console.error("Project ID is missing!"); // Handle the error gracefully
              return;
            }
            submitUpload(projectId, navigate);
          }}
          disabled={isUploading || uploadedImages.length === 0}
          className="relative overflow-hidden"
        >
          {isUploading ? 'Uploading...' : 'Upload to Project'}
          {isUploading && (
            <span className="absolute bottom-0 left-0 h-1 bg-white/30 animate-upload-progress"></span>
          )}
        </Button>
      </div>
      
      {uploadedImages.length > 10 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            You have selected a large number of images. Consider reviewing your selection before uploading.
          </p>
        </div>
      )}
    </div>
  );
};
