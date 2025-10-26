import { FC } from "react";
import "./split-card.css";

interface SplitCardProps {
  title: string;
  count: number;
  percentage?: number;
  color: string;
}

const SplitCard: FC<SplitCardProps> = ({ title, count, percentage, color }) => {
  return (
    <div className="split-card" style={{ borderColor: color }}>
      <div className="split-card-header">
        <span className="split-card-title">{title}</span>
        <span className="split-card-percentage" style={{ backgroundColor: color }}>
          {percentage ? `${percentage}%` : "%"}
        </span>
      </div>
      <div className="split-card-body">
        <h2>{count}</h2>
        <span>Images</span>
      </div>
    </div>
  );
};

export default SplitCard;