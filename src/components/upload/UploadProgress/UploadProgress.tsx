import React from 'react';
import { UploadedImage } from '@/contexts/UploadContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import './UploadProgress.css';

interface UploadProgressProps {
  files: UploadedImage[];
  visible: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ files, visible }) => {
  if (!visible) return null;
  
  const uploadingFiles = files.filter(file => file.status === 'uploading');
  const completedFiles = files.filter(file => file.status === 'success' || file.status === 'error');
  const totalFiles = uploadingFiles.length + completedFiles.length;
  const successFiles = files.filter(file => file.status === 'success').length;
  const errorFiles = files.filter(file => file.status === 'error').length;
  
  if (totalFiles === 0) return null;
  const overallProgress = Math.round(
    (uploadingFiles.reduce((sum, file) => sum + file.progress, 0) + completedFiles.length * 100) / 
    (totalFiles * 100) * 100
  );

  return (
    <div className="upload-progress-overlay">
      <div className="upload-progress-modal">
        <div className="upload-progress-header">
          <h3>Uploading Files</h3>
          {uploadingFiles.length === 0 && (
            <div className="upload-status">
              {errorFiles > 0 ? (
                <span className="upload-status-error">
                  <AlertCircle size={16} />
                  {errorFiles} failed
                </span>
              ) : (
                <span className="upload-status-success">
                  <CheckCircle size={16} />
                  Complete
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="upload-progress-bar-container">
          <div 
            className="upload-progress-bar" 
            style={{ width: `${overallProgress}%` }}
            data-status={errorFiles > 0 ? 'error' : 'success'}
          ></div>
        </div>
        
        <div className="upload-progress-stats">
          <span>{successFiles} of {totalFiles} complete</span>
          <span>{overallProgress}%</span>
        </div>
        
        <div className="upload-progress-files">
          {files.filter(file => file.status !== 'pending').map(file => (
            <div key={file.id} className="upload-progress-file">
              <div className="upload-progress-file-name">{file.file.name}</div>
              <div className="upload-progress-file-status">
                {file.status === 'uploading' && (
                  <Loader2 className="animate-spin" size={16} />
                )}
                {file.status === 'success' && (
                  <CheckCircle className="status-icon success" size={16} />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="status-icon error" size={16} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;