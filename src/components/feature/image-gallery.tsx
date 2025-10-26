import React, { useState } from "react";
import ImageModal from "../ui/modal/image-modal";
import './image-gallery.css';

type Image = {
    image_url: string;
    image_name?: string;
};

type ImageGalleryProps = {
    images: Image[];
    handleImageClick?: (index: number) => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, handleImageClick }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const openModal = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const onClose = () => {
        setIsOpen(false);
    };

    if (!images || images.length === 0) return <p>No images available.</p>;

    return (
        <div className="image-preview-container">
            <div className="image-preview">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image.image_url}
                        alt={`Uploaded ${index}`}
                        className="thumbnail-preview"
                        loading="lazy"
                        onClick={() => openModal(index)}
                    />
                ))}
            </div>

            {isOpen && (
                <ImageModal 
                    isOpen={isOpen}
                    onClose={onClose}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    images={images}
                />
            )}
        </div>
    );
};

export default ImageGallery;
