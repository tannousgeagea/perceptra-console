import React from 'react';
import { Button } from '@/components/ui/ui/button';
import { Checkbox } from '@/components/ui/ui/checkbox';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '../ui/header/Header';

interface ClassesHeaderProps {
  classesLocked: boolean;
  onToggleLock: (locked: boolean) => void;
}

const ClassesHeader = ({ classesLocked, onToggleLock }: ClassesHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center justify-between mb-6">
      <Header title='Classes & Tags'/>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="lock-classes" 
            checked={classesLocked} 
            onCheckedChange={(checked) => onToggleLock(!!checked)}
          />
          <label htmlFor="lock-classes" className="text-sm text-black">Lock Classes</label>
        </div>
        <Button variant="outline" onClick={() => {
          toast({
            title: "What is a class?",
            description: "Classes are labels used to categorize objects in your annotations. Each class can have a unique name and color.",
            duration: 5000
          });
        }}>What is a class?</Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Modify Classes
        </Button>
      </div>
    </div>
  );
};

export default ClassesHeader;