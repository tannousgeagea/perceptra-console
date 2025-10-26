import { FC } from "react";
import "./error-popup.css";

interface ErrorPopupProps {
  message: string | null;
  onClose: () => void;
}

const ErrorPopup: FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <h3>Error</h3>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorPopup;