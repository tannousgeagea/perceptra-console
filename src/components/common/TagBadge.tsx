
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Function to generate consistent colors based on tag string
const getTagColor = (tag: string): string => {
  // Simple hash function
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Map to limited set of predefined colors for consistency
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-orange-100 text-orange-800',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  className,
  size = 'md',
}) => {
  return (
    <span
      className={cn(
        "tag-badge",
        getTagColor(tag),
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
        className
      )}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-white/20"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default TagBadge;