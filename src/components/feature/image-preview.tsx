import { FC } from "react";
import './image-gallery.css';

interface ImagePreviewProps {
  images: string[];
}

const ImagePreview: FC<ImagePreviewProps> = ({ images }) => {
    return (
        <div className="image-preview-container">
            <div className="image-preview">
                {images.map((image: string, index: number) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Uploaded ${image}`} 
                        className='thumbnail-preview'               
                    />
                ))}
            </div>
        </div>
    );
};

export default ImagePreview;