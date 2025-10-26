import React, { useState } from 'react';
import { Input } from '@/components/ui/ui/input';
import { Button } from '@/components/ui/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AddClassFormProps {
  onAddClass: (className: string) => void;
  existingClasses: { name: string }[];
}

const AddClassForm = ({ onAddClass, existingClasses }: AddClassFormProps) => {
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
    <div className="mt-4 flex items-center gap-2">
      <Input
        className='bg-white border-gray p-2 text-black'
        placeholder="Enter new class name" 
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleAddClass();
        }}
      />
      <Button onClick={handleAddClass}>Add Class</Button>
    </div>
  );
};

export default AddClassForm;