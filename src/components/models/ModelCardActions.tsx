import React from "react";
import { MoreHorizontal, Pencil, Trash2, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/ui/dropdown-menu";

interface ModelCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTrain: () => void;
}

const ModelCardActions: React.FC<ModelCardActionsProps> = ({
  onEdit,
  onDelete,
  onDuplicate,
  onTrain,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="cursor-pointer"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Model
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onDuplicate();
          }}
          className="cursor-pointer"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onTrain();
          }}
          className="cursor-pointer"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Training
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Model
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelCardActions;