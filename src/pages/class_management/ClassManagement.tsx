import React, { useState } from 'react';
import { useClasses } from '@/contexts/ClassesContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/ui/tabs';
import ClassesHeader from '@/components/classes/ClassesHeader';
import ClassesTable from '@/components/classes/ClassesTable';
import AddClassForm from '@/components/classes/AddClassForm';
import TagsPanel from '@/components/classes/TagsPanel';
import { Loader2 } from 'lucide-react';
import { ClassesProvider } from '@/contexts/ClassesContext';

const ClassesManagement = () => {
  const { 
    classes, 
    addClass, 
    updateClass, 
    deleteClass, 
    classesLocked, 
    setClassesLocked,
    isLoading,
    refreshClasses
  } = useClasses();

  const handleRefresh = () => {
    refreshClasses();
  };


  return (
    <ClassesProvider>
      <div className="container mx-auto py-12 w-full">
        <ClassesHeader 
          classesLocked={classesLocked}
          onToggleLock={setClassesLocked}
        />

        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes" className="relative">
              Classes
              <span className="ml-1 text-xs text-black bg-gray-200 px-1.5 py-0.5 rounded-full">{classes.length}</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="relative">
              Tags
              <span className="ml-1 text-xs text-black bg-gray-200 px-1.5 py-0.5 rounded-full">0</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="classes">
            <ClassesTable 
              classes={classes}
              onUpdateClass={updateClass}
              onDeleteClass={deleteClass}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
            <AddClassForm 
              onAddClass={addClass}
              existingClasses={classes}
            />

            {isLoading && (
              <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Loading data...
              </div>
            )}

          </TabsContent>
          
          <TabsContent value="tags">
            <TagsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </ClassesProvider>
  );
};

export default ClassesManagement;