import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackArrow.css';
import { ChevronLeft } from 'lucide-react';

const BackArrow: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1)
  };

  return (
    <div className="back-arrow" onClick={handleGoBack}>
      <ChevronLeft />
    </div>
  );
};

export default BackArrow;
