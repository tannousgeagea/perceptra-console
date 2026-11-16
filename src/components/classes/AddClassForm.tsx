import React, { useState } from 'react';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AddClassFormProps {
  onAddClass: (className: string) => void;
  existingClasses: { name: string }[];
  /** Set when the person may not add classes; disables the form and explains why. */
  lockedReason?: string;
}

const AddClassForm = ({ onAddClass, existingClasses, lockedReason }: AddClassFormProps) => {
  const [newClassName, setNewClassName] = useState('');
  const { toast } = useToast();

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Class name cannot be empty",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    if (existingClasses.some(c => c.name === newClassName.trim())) {
      toast({
        title: "Class with this name already exists",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    onAddClass(newClassName.trim());
    setNewClassName('');
    toast({
      title: "Class added successfully",
      duration: 2000
    });
  };

  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          className='bg-white dark:bg-gray-900 border-gray dark:border-gray-600 p-2 text-black dark:text-gray-100'
          placeholder="Enter new class name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !lockedReason) handleAddClass();
          }}
          disabled={!!lockedReason}
        />
        <Button onClick={handleAddClass} disabled={!!lockedReason} title={lockedReason}>Add Class</Button>
      </div>
      {lockedReason && <p className="text-xs text-muted-foreground">{lockedReason}.</p>}
    </div>
  );
};

export default AddClassForm;