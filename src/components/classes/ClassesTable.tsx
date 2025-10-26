import React, { useState } from 'react';
import { AnnotationClass } from '@/contexts/ClassesContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/ui/table';
import ClassRow from './ClassRow';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/ui/button';
import { Skeleton } from '@/components/ui/ui/skeleton';

interface ClassesTableProps {
  classes: AnnotationClass[];
  onUpdateClass: (id: string, updates: Partial<AnnotationClass>) => void;
  onDeleteClass: (id: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const ClassesTable = ({ 
  classes, 
  onUpdateClass, 
  onDeleteClass,
  isLoading = false,
  onRefresh 
}: ClassesTableProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'classId'>('name');

  const handleSort = (column: 'name' | 'count' | 'classId') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'count') {
      return sortOrder === 'asc' 
        ? a.count - b.count 
        : b.count - a.count;
    } else {
      // Sort by classId
      return sortOrder === 'asc'
        ? (a.classId || 0) - (b.classId || 0)
        : (b.classId || 0) - (a.classId || 0);
    }
  });
  return (
    <div className="bg-white text-black rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-gray-50/60 border-b border-gray-100">
        <h3 className="font-medium text-gray-700 pl-2">Classes</h3>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="text-gray-500"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100/70">
            <TableHead className="w-24">COLOR</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100/70 transition-colors"
              onClick={() => handleSort('classId')}
            >
              CLASS ID
              <span className="inline-block ml-1">
                {sortBy === 'classId' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />)}
              </span>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-100/70 transition-colors"
              onClick={() => handleSort('name')}
            >
              CLASS NAME
              <span className="inline-block ml-1">
                {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />)}
              </span>
            </TableHead>
            <TableHead 
              className="text-right w-24 cursor-pointer hover:bg-gray-100/70 transition-colors"
              onClick={() => handleSort('count')}
            >
              COUNT
              <span className="inline-block ml-1">
                {sortBy === 'count' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />)}
              </span>
            </TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full max-w-[200px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : sortedClasses.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No classes available. Create your first class below.
              </TableCell>
            </TableRow>
          ) : (
            // Actual data rows
            sortedClasses.map((cls, index) => (
              <ClassRow 
                key={cls.id} 
                cls={cls} 
                onUpdate={onUpdateClass} 
                onDelete={onDeleteClass}
                isEven={index % 2 === 0}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassesTable;