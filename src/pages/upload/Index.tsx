import React from 'react';
import { UploadProvider } from '@/contexts/UploadContext';
import { UploadPage } from './upload'

const UploadIndex = () => {
  return (
    <UploadProvider>
      <UploadPage />
    </UploadProvider>
  );
};

export default UploadIndex;