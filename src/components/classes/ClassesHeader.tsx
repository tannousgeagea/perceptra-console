import { Button } from '@/components/ui/ui/button';
import { Plus } from 'lucide-react';
import Header from '../ui/header/Header';

interface ClassesHeaderProps {
  /** Set when the person may not change classes. */
  lockedReason?: string;
}

// "Add class" takes you to the name field under the table.
const focusNewClass = () => {
  const input = document.getElementById('new-class-name');
  input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input?.focus({ preventScroll: true });
};

const ClassesHeader = ({ lockedReason }: ClassesHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div className="space-y-1">
      <Header title='Classes & Tags'/>
      <p className="max-w-prose text-sm text-muted-foreground">
        The labels annotations use. Renaming a class or changing its colour keeps its annotations.
      </p>
    </div>
    <Button onClick={focusNewClass} disabled={!!lockedReason} title={lockedReason}>
      <Plus className="mr-2 h-4 w-4" />
      Add class
    </Button>
  </div>
);

export default ClassesHeader;
