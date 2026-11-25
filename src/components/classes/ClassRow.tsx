import React, { useState } from 'react';
import { AnnotationClass } from '@/contexts/ClassesContext';
import { TableCell, TableRow } from '@/components/ui/ui/table';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ColorPicker from '@/components/classes/ColorPicker';
import { Badge } from '@/components/ui/ui/badge';
import DeleteClassDialog from './DeleteClassDialog';
import type { DeleteClassChoice } from './api';

interface ClassRowProps {
  cls: AnnotationClass;
  /** The project's other classes (where a deleted class's annotations can move). */
  others: AnnotationClass[];
  onUpdate: (id: string, updates: Partial<AnnotationClass>) => Promise<void>;
  onDelete: (id: string, choice?: DeleteClassChoice) => Promise<void>;
  isEven: boolean;
  /** Set when the person may not change classes; disables editing and deleting. */
  lockedReason?: string;
}

const ClassRow = ({ cls, others, onUpdate, onDelete, isEven, lockedReason }: ClassRowProps) => {
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(cls.name);
  };

  const saveEditing = async () => {
    if (!editingName.trim()) {
      toast({
        title: "Class name cannot be empty",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    if (cls.classId == null) {   // 0 is a real class number
      toast({
        title: "Class Id cannot be empty",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    try {
      await onUpdate(String(cls.classId), { name: editingName.trim() });
    } catch {
      return;   // the error toast is already shown; keep the field open
    }
    setIsEditing(false);
    setEditingName('');
    toast({ title: "Class renamed", duration: 2000 });
  };

  const handleColorChange = async (color: string) => {
    try {
      await onUpdate(String(cls.classId), { color });
      toast({ title: "Color updated", duration: 2000 });
    } catch {
      // the error toast is already shown
    }
  };

  return (
    <TableRow 
      key={cls.id} 
      className={`group transition-colors ${isEven ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/40 dark:bg-gray-900/40'} hover:bg-gray-100/70 dark:hover:bg-gray-700/70`}
    >
      <TableCell>
        <ColorPicker 
          color={cls.color}
          onChange={handleColorChange}
          disabledReason={lockedReason}
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono">
          {cls.classId ?? '—'}
        </Badge>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="bg-white dark:bg-gray-900 max-w-[200px]"
            />
            <Button size="sm" onClick={saveEditing}>Save</Button>
            <Button size="sm" variant="outline" className='bg-white dark:bg-gray-900' onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {cls.name}
            <Button
              variant="ghost"
              size="icon"
              onClick={startEditing}
              disabled={!!lockedReason}
              title={lockedReason ?? 'Rename class'}
              aria-label="Rename class"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">{cls.count}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
          disabled={!!lockedReason}
          title={lockedReason ?? 'Delete class'}
          aria-label={`Delete class ${cls.name}`}
          onClick={() => setDeleting(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {deleting && (
          <DeleteClassDialog cls={cls} others={others} open={deleting} onOpenChange={setDeleting} onDelete={onDelete} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default ClassRow;