import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './annotate.css'
import BinIcon from '../../assets/icons/bin.png'

const ImageAnnotation = () => {
    const { imageId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { images = [], currentIndex = 0 } = location.state || {};

    if (!images || images.length === 0) return <p>No images available.</p>;
    
    const image = images[currentIndex];
    if (!image) {
        return <p>Image not found</p>;
    }

    const goToNext = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        navigate(`/annotate/${nextIndex}`, { state: { images, currentIndex: nextIndex } });
    };

    const goToPrevious = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        navigate(`/annotate/${prevIndex}`, { state: { images, currentIndex: prevIndex } });
    };

    const handleDeleteClick = () => {
        console.log('delete')
    }

    return (
        <div className="annotation-container">
            <div className="image-wrapper">
                <div className="delete-icon" onClick={handleDeleteClick}>
                    <img src={BinIcon} alt="bin" />
                </div>
                <img src={image.image_url} alt={`Annotate ${imageId}`} className="large-image" />
            </div>
            <div className="image-navigation">
                <button className="prev" onClick={goToPrevious}>
                    &#10094; Previous
                </button>
                <button className="next" onClick={goToNext}>
                    Next &#10095;
                </button>
            </div>
        </div>
    );
    
};

export default ImageAnnotation;

