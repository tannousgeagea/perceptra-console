import { useState, useEffect } from 'react';
import { AnnotationProvider } from '@/contexts/AnnotationContext';
import ToolBar from './components/ToolBar';
import Canvas from './components/Canvas';
import LabelPanel from './LabelPanel';
import AnnotationControls from './components/AnnotationControl';
import { useLocation } from 'react-router-dom';
import ActionSidebar from './components/ActionSidebar';

// interface ImageResponse {
//   data?: Array<{ image_id: string, image_url: string, image_name: string }>;
// }

const AnnotationTool = () => {
  const location = useLocation();
  const { images, currentIndex = 0 } = location.state || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex)
  const totalImages = images?.data.length


  const handlePrevious = () => {
    const prevIndex: number = (currentImageIndex - 1 + totalImages) % totalImages;
    setCurrentImageIndex(prevIndex)
  };

  const handleNext = () => {
    if (currentIndex < totalImages) {
      const nextIndex: number = (currentImageIndex + 1) % totalImages;
      setCurrentImageIndex(nextIndex);
    };
  };

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === 'ArrowLeft') {
  //       handlePrevious();
  //     } else if (event.key === 'ArrowRight') {
  //       handleNext();
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [currentImageIndex, totalImages]);

  const image = images?.data[currentImageIndex];
  if (!image) {
      return <p>Image not found</p>;
  }

  const image_name = image.image_name
  return (
    <AnnotationProvider>
      <div className='dark bg-background text-foreground w-full h-screen overflow-hidden'>
        <AnnotationControls
          title={image_name}
          current={currentImageIndex + 1}
          total={totalImages}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <div className="flex h-full bg-card">
          <div className="w-56 p-4 border-r border-border flex flex-col gap-4">
            <ToolBar />
            <LabelPanel />
          </div>
          {totalImages === 0? (
            <p>No Image Found</p>
          ) : (
            <div className='flex flex-1'>
             <Canvas image={image}/>
             <ActionSidebar currentImage={image} goToNextImage={handleNext} />
            </div>
          )}
        </div>
      </div>
    </AnnotationProvider>
  );
};

export default AnnotationTool;
