import { FC } from "react";
import "./success-popup.css";

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

const SuccessPopup: FC<SuccessPopupProps> = ({ message, onClose }) => {
  return (
    <div className="popup success-popup">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SuccessPopup;