import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/ui/table";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/ui/tooltip";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { formatDistance } from "date-fns";
import TagBadge from "@/components/common/TagBadge";
import { ImageRecord } from "@/types/image"

interface ImageTableProps {
  images: ImageRecord[];
  selectedImages: string[];
  onImageClick: (image: ImageRecord) => void;
  toggleImageSelection: (id: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
}

const ImageTable: React.FC<ImageTableProps> = ({
  images,
  selectedImages,
  onImageClick,
  toggleImageSelection,
  sortOrder,
  setSortOrder,
}) => {
  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={images.length > 0 && selectedImages.length === images.length}
                onCheckedChange={() => {
                  if (selectedImages.length === images.length) {
                    // Clear all selections
                    selectedImages.forEach(image_id => toggleImageSelection(image_id));
                  } else {
                    // Select all images that aren't already selected
                    images
                      .filter(img => !selectedImages.includes(img.image_id))
                      .forEach(img => toggleImageSelection(img.image_id));
                  }
                }}
              />
            </TableHead>
            <TableHead className="w-[100px]">Thumbnail</TableHead>
            <TableHead>Name</TableHead>
            <TableHead onClick={toggleSort} className="cursor-pointer">
              <div className="flex items-center">
                Date
                <span className="ml-2">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              </div>
            </TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Uploaded by</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => {
            const isSelected = selectedImages.includes(image.image_id);
            const relativeDate = formatDistance(new Date(image.created_at), new Date(), { addSuffix: true });

            return (
              <TableRow key={image.id} className={isSelected ? "bg-muted" : ""}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleImageSelection(image.image_id)}
                  />
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                          <img
                            src={image.download_url}
                            alt={image.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="max-h-[300px] max-w-[300px]">
                          <img
                            src={image.download_url}
                            alt={image.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-medium">{image.name}</TableCell>
                <TableCell>{relativeDate}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 2).map((tag) => (
                      <TagBadge key={`${image.id}-${tag}`} tag={tag} size="sm" />
                    ))}
                    {image.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{image.tags.length - 2} more</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{image.source_of_origin}</TableCell>
                <TableCell>
                  {image.uploaded_by ? image.uploaded_by : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onImageClick(image)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImageTable;