import React from "react";
import { MoreHorizontal, Pencil, Trash2, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/ui/button";
import { useParams } from "react-router-dom";
import { useProjectPermissions } from "@/hooks/usePermissions";
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
  // The server's project permissions: editors edit, duplicate and train;
  // deleting is for project admins.
  const { projectId } = useParams<{ projectId: string }>();
  const permissions = useProjectPermissions(projectId);
  const canEdit = permissions.can('edit');
  const canManage = permissions.can('manage');
  const EDIT_HINT = 'Needs the editor role in this project';
  const MANAGE_HINT = 'Needs the admin role in this project';
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
          disabled={!canEdit}
          title={canEdit ? undefined : EDIT_HINT}
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
          disabled={!canEdit}
          title={canEdit ? undefined : EDIT_HINT}
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
          disabled={!canEdit}
          title={canEdit ? undefined : EDIT_HINT}
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
          disabled={!canManage}
          title={canManage ? undefined : MANAGE_HINT}
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