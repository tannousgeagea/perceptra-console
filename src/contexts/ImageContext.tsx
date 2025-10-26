import React, { createContext, useContext, useState } from 'react';

interface Image {
  id: string;
  url: string;
}

interface ImageContextType {
  currentImage: Image;
  goToNextImage: (nextImageId?: string) => void;
}

const mockImages: Image[] = [
  {
    id: '61bc256f-bb16-4ef7-9d6d-5b1075632b88',
    url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7'
  },
  {
    id: 'second-image',
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa'
  },
  {
    id: 'third-image',
    url: 'https://images.unsplash.com/photo-1620812095301-e57178697eed'
  }
];

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToNextImage = (nextImageId?: string) => {
    if (nextImageId) {
      // If we have a specific next image ID, find it
      const nextIndex = mockImages.findIndex(img => img.id === nextImageId);
      if (nextIndex !== -1) {
        setCurrentImageIndex(nextIndex);
        return;
      }
    }
    
    // Otherwise go to the next image in the array
    setCurrentImageIndex(prev => (prev + 1) % mockImages.length);
  };

  return (
    <ImageContext.Provider
      value={{
        currentImage: mockImages[currentImageIndex],
        goToNextImage
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};
