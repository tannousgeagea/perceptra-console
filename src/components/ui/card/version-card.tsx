import { FC } from "react";
import { useLocation } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import "./version-card.css";

interface Version {
    id: string;
    version_number: string;
    created_at: string;
    name: string;
    count_images: number;
}

interface VersionCardProps {
    version: Version;
    onView: (versionNumber: string) => void;
}

const formatEditedTime = (isoDateString: string): string => {
    const date = parseISO(isoDateString);
    return `${formatDistanceToNow(date, { addSuffix: true })}`;
};

const formatCreatedTime = (isoDateString: string): string => {
    const date = parseISO(isoDateString);
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric", hour12: true };
    return date.toLocaleString("en-US", options);
}

const VersionCard: FC<VersionCardProps> = ({ version, onView }) => {
    const location = useLocation();
    const isSelected = location.pathname.includes(version.version_number);

    return (
        <div
          className={`relative p-4 min-w-[250px] rounded-xl shadow-md border transition-all cursor-pointer 
            ${isSelected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-100"}`}
          onClick={() => onView(version.version_number)}
        >
          {/* ID Badge */}
          <div className="absolute top-2 right-2 text-xs bg-gray-100 border border-gray-300 text-gray-600 rounded-full px-2 py-0.5">
            ID: {version.id}
          </div>
    
          {/* Main Content */}
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500">{formatCreatedTime(version.created_at)}</div>
            <div className="font-semibold text-gray-800">{version.name}</div>
            <div className="text-xs text-gray-500">Edited {formatEditedTime(version.created_at)}</div>
            <div className="mt-2 text-sm font-medium text-gray-600">Images • {version.count_images}</div>
          </div>
        </div>
      );
    };

export default VersionCard;