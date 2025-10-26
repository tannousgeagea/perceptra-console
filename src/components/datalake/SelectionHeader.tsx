
import React from "react";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { Button } from "@/components/ui/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/ui/select";

interface SelectionHeaderProps {
  selectedImages: string[];
  filteredImages: Array<{ id: string; [key: string]: any }>;
  toggleSelectAll: () => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  projectOptions: Array<{ id: string; name: string }>;
  handleAddToProject: () => void;
}

const SelectionHeader: React.FC<SelectionHeaderProps> = ({
  selectedImages,
  filteredImages,
  toggleSelectAll,
  selectedProject,
  setSelectedProject,
  projectOptions,
  handleAddToProject,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Checkbox 
          id="select-all"
          checked={selectedImages.length > 0 && selectedImages.length === filteredImages.length}
          onCheckedChange={toggleSelectAll}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="select-all" className="text-sm">
          {selectedImages.length === 0 
            ? "Select All" 
            : `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected`}
        </label>
      </div>
      
      {selectedImages.length > 0 && (
        <div className="flex space-x-3 items-center">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add to project..." />
            </SelectTrigger>
            <SelectContent>
              {projectOptions.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToProject} 
            disabled={!selectedProject}
          >
            Add to Project
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectionHeader;
