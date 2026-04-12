import React from 'react';
import { UploadedImage } from '@/types/upload';
import { Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImageCardProps {
  file: UploadedImage;
  onRemove: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ file, onRemove }) => {

  const renderStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="animate-spin text-gray-500" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="group rounded-lg shadow-sm bg-white dark:bg-gray-800 transition hover:-translate-y-1 hover:shadow-lg">

      {/* Preview */}
      <div className="relative bg-slate-100 dark:bg-slate-800 overflow-hidden aspect-3/4">

        <img
          src={file.previewUrl}
          alt={file.file.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status */}
        {file.status !== 'pending' && (
          <div className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow">
            {renderStatusIcon()}
          </div>
        )}

        {/* Remove Button */}
        {file.status === 'pending' && (
          <button
            onClick={() => onRemove(file.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
          >
            <Trash2 className='w-4 h-4' />
          </button>
        )}

        {/* Upload Progress */}
        {file.status === 'uploading' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate"
          title={file.file.name}
        >
          {file.file.name}
        </p>

        <div className="text-xs text-slate-500">
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(file.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};