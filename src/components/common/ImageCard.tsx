import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/ui/card";
import { cn } from "@/lib/utils";
import TagBadge from "./TagBadge";

interface ImageCardProps {
  id: string;
  src: string;
  name: string;
  source?: string;
  tags?: string[];
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  id,
  src,
  name,
  source,
  tags = [],
  onClick,
  className,
  selected = false,
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer image-card-hover", 
        className,
        selected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 relative aspect-square bg-muted">
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {source && (
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-md text-xs">
            {source}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 flex-col items-start">
        <h3 className="text-sm font-medium truncate w-full">{name}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={`${id}-${tag}`} tag={tag} size="sm" />
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tags.length - 3} more</span>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ImageCard;