import { baseURL } from "./base";
import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';

interface HandleUploadParams {
  files: File[] | null;
  setUploading: (uploading: boolean) => void;
  setUploadPercentage: (percentage: number) => void;
  setUploadComplete: (complete: boolean) => void;
}

const handleUpload = async ({ files, setUploading, setUploadPercentage, setUploadComplete }: HandleUploadParams): Promise<void> => {
    if (!files) return;

    const formData = new FormData();
    files.forEach((file: File) => {
      formData.append('files', file, file.name);
    });

    setUploading(true);
    setUploadPercentage(0);

    try {
      const response: AxiosResponse = await axios.post(`${baseURL}/api/v1/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
            setUploadPercentage(percent);
          }
        },
      });

      if (response.status === 200) {
        setUploadComplete(true);
        console.log('Upload successful!');
      } else {
        alert(`Upload Failed: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
};

export default handleUpload;