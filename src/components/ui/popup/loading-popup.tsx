import { FC } from "react";
import "./loading-popup.css";
import Spinner from "../animation/spinner";

const LoadingPopup: FC = () => {
  return (
    <div className="popup loading-popup">
      <div className="popup-content">
        <Spinner />
      </div>
    </div>
  );
};

export default LoadingPopup;