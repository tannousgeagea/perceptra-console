import React from "react";
import "./AugmentationCard.css";

interface AugmentationCardProps {
  name: string;
  description: string;
  exampleImage: string; // URL of example image showing the augmentation
}

const AugmentationCard: React.FC<AugmentationCardProps> = ({ name, description, exampleImage }) => {
  return (
    <div className="augmentation-card">
      <div className="augmentation-card-image-container">
        <img src={exampleImage} alt={`${name} example`} />
      </div>
      <div className="augmentation-info">
        <h3 className="augmentation-title">{name}</h3>
        {/* <p className="augmentation-description">{description}</p> */}
      </div>
    </div>
  );
};

export default AugmentationCard;
