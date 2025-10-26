import { useState, useCallback} from 'react';
import { useDropzone } from 'react-dropzone';
import ImageCanvas from './ui/ImageCanvas';
import { baseURL } from '../api/base';
import './ImageAnalysis.css';

interface Prediction {
  id: string;
  confidence: number;
  class: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color:string;
}

const ImageAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async( file: File ) => {
    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(
        `${baseURL}/api/v1/analyse`,
        {
          method: "POST",
          body: formData,
        });

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }

      const result = await response.json();
      setPredictions(result.predictions);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        handleImageUpload(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    multiple: false,
  });

  const handleReset = () => {
    setImage(null);
    setPredictions([]);
  };
  return (
    <div className="image-analysis-container">
      <div className="image-analysis-card">
        {!image ? (
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="emoji">📸</div>
              <p className="dropzone-title">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
              </p>
              <p className="dropzone-subtitle">or click to select a file</p>
            </div>
          </div>
        ) : (
          <div>
            <ImageCanvas 
              imageUrl={image}
              boxes={predictions}
              loading={isAnalyzing}
            />
            <button onClick={handleReset} className="reset-button">
              Try Another Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysis;