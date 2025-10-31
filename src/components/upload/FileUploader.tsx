
import React, { useState, useRef } from 'react';
import { Upload, FolderUp, FileUp, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/ui/progress';
import { Button } from '@/components/ui/ui/button';
import { useUploadContext } from '@/contexts/UploadContext';
import UploadProgress from './UploadProgress/UploadProgress';

// Add this to extend the HTMLInputElement interface to include webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
  }
}

export const FileUploader: React.FC = () => {
  const { uploadedImages, addImages, uploadProgress, isUploading, clearAllImages } = useUploadContext();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Filter for images
    const imageFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
    );
    
    if (imageFiles.length === 0) {
      toast({
        title: 'No valid images',
        description: 'Please select valid image files (JPG, PNG, GIF, WEBP)',
        variant: 'destructive'
      });
      return;
    }
    
    addImages(imageFiles);
    
    toast({
      title: 'Images added',
      description: `${imageFiles.length} images have been added successfully.`
    });
    
    // Reset the input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      
      // Filter for images
      const imageFiles = fileArray.filter(file => 
        file.type.startsWith('image/') || 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      );
      
      if (imageFiles.length === 0) {
        toast({
          title: 'No valid images',
          description: 'Please select valid image files (JPG, PNG, GIF, WEBP)',
          variant: 'destructive'
        });
        return;
      }
      
      addImages(imageFiles);
      
      toast({
        title: 'Images added',
        description: `${imageFiles.length} images have been added successfully.`
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div 
        className={`upload-zone border-2 border-dashed rounded-lg p-12 transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.gif,.webp"
          multiple
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,.gif,.webp"
          multiple
          webkitdirectory=""
          className="hidden"
          id="folder-upload"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="text-center text-gray-600">
            Drag & drop images here, or
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="default" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <FileUp className="mr-2 h-4 w-4"/>
              Select Files
            </Button>
            <Button 
              variant="default" 
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <FolderUp className="mr-2 h-4 w-4" />
              Select Folder
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            Supports JPG, PNG, GIF, WEBP
          </p>
        </div>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-gray-600">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllImages}
          className="text-red-500 bg-white hover:text-red-700 hover:bg-red-50"
          disabled={isUploading}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>
      </div>
      <UploadProgress files={uploadedImages} visible={isUploading} />
    </div>

  );
};