import React, { useState } from 'react';
import { AnnotationClass } from '@/contexts/ClassesContext';
import { TableCell, TableRow } from '@/components/ui/ui/table';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ColorPicker from '@/components/classes/ColorPicker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/ui/alert-dialog';
import { Badge } from '@/components/ui/ui/badge';

interface ClassRowProps {
  cls: AnnotationClass;
  onUpdate: (id: string, updates: Partial<AnnotationClass>) => void;
  onDelete: (id: string) => void;
  isEven: boolean;
}

const ClassRow = ({ cls, onUpdate, onDelete, isEven }: ClassRowProps) => {
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(cls.name);
  };

  const saveEditing = () => {
    if (!editingName.trim()) {
      toast({
        title: "Class name cannot be empty",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    if (!cls.classId) {
      toast({
        title: "Class Id cannot be empty",
        variant: "destructive",
        duration: 2000
      });
      return;
    }

    onUpdate(String(cls.classId), { name: editingName.trim() });
    setIsEditing(false);
    setEditingName('');
    toast({
      title: "Class updated successfully",
      duration: 2000
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate(String(cls.classId), { color });
    toast({
      title: "Color updated",
      duration: 2000
    });
  };

  return (
    <TableRow 
      key={cls.id} 
      className={`group transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/40'} hover:bg-gray-100/70`}
    >
      <TableCell>
        <ColorPicker 
          color={cls.color} 
          onChange={handleColorChange}
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 font-mono">
          {cls.classId || '—'}
        </Badge>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="bg-white max-w-[200px]"
            />
            <Button size="sm" onClick={saveEditing}>Save</Button>
            <Button size="sm" variant="outline" className='bg-white' onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {cls.name}
            <Button variant="ghost" size="icon" onClick={startEditing}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">{cls.count}</TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50/50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this class? This action cannot be undone.
                {cls.count > 0 && (
                  <p className="text-red-500 mt-2">
                    Warning: This class is used in {cls.count} annotations.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onDelete(String(cls.classId))}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};

export default ClassRow;