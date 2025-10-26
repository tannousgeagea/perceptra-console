import React, { useState } from 'react';
import { UploadedImage } from '@/contexts/UploadContext';
import { Trash2, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import './ImageCard.css';

interface ImageCardProps {
  file: UploadedImage;
  onRemove: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ file, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="animate-spin status-icon" size={16} />;
      case 'success':
        return <CheckCircle className="status-icon success" size={16} />;
      case 'error':
        return <AlertCircle className="status-icon error" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="image-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="image-card-preview">
        <img src={file.previewUrl} alt={file.file.name} />
        
        {file.status !== 'pending' && (
          <div className="image-card-status">
            {getStatusIcon()}
          </div>
        )}
        
        {(isHovered || file.status === 'pending') && (
          <button
            className="image-card-remove"
            onClick={() => onRemove(file.id)}
            aria-label="Remove image"
          >
            <Trash2 size={16} />
          </button>
        )}
        
        {file.status === 'uploading' && (
          <div className="image-card-progress">
            <div
              className="image-card-progress-bar"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="image-card-info">
        <div className="image-card-name" title={file.file.name}>
          {file.file.name}
        </div>
        <div className="image-card-meta">
          {(file.file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>
    </div>
  );
};

export default ImageCard;