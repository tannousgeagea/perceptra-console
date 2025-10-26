import React from 'react';
import { Card } from '@/components/ui/ui/card';
import { Button } from '@/components/ui/ui/button';
import { Progress } from '@/components/ui/ui/progress';
import { Upload, Image, Video, X, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useInference } from '@/hooks/useInference';

interface FileUploadProps {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  selectedModel: any;
  parameters: any;
  setResults: (results: any) => void;
  isComparisonMode: boolean;
  comparisonModel: any;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFile,
  setUploadedFile,
  selectedModel,
  parameters,
  setResults,
  isComparisonMode,
  comparisonModel
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { runInference: runInferenceTest, isProcessing: isProcessing, progress: progress, results: results } = useInference({
    confidenceThreshold: 0.25,
  });
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  React.useEffect(() => {
    if (results) {
      setResults(results);
      toast({
        title: "Inference completed",
        description: `Processed with ${selectedModel.name}${isComparisonMode ? ` and ${comparisonModel.name}` : ''}`
      });
    }
  }, [results]);
  
  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPEG, PNG, GIF) or video (MP4, WebM)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for inference`
    });
  };

const handleRunInference = () => {
  if (!selectedModel || !uploadedFile) {
    toast({
      title: "Missing requirements",
      description: "Please select a model and upload a file",
      variant: "destructive"
    });
    return;
  }

  if (isComparisonMode && !comparisonModel) {
    toast({
      title: "Missing comparison model",
      description: "Please select a comparison model or disable comparison mode",
      variant: "destructive"
    });
    return;
  }

  runInferenceTest({
    file: uploadedFile,
    selectedModel,
    comparisonModel: isComparisonMode ? comparisonModel : undefined,
  });
};

  const isVideo = uploadedFile?.type.startsWith('video/');
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {!uploadedFile ? (
          <Card
            className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-8 text-center">
              <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload your file
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your image or video here, or click to browse
              </p>
              <Button variant="outline">
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Supports JPEG, PNG, GIF, MP4, WebM • Max 50MB
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isVideo ? (
                  <Video className="w-8 h-8 text-blue-500" />
                ) : (
                  <Image className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFile(null);
                  setResults(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {isProcessing && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </Card>
        )}

        <div className="flex justify-center">
          <Button
            onClick={handleRunInference}
            disabled={!selectedModel || !uploadedFile || isProcessing}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Run Inference'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
};