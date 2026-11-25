import { useClasses } from '@/contexts/ClassesContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/ui/tabs';
import ClassesHeader from '@/components/classes/ClassesHeader';
import ClassesTable from '@/components/classes/ClassesTable';
import AddClassForm from '@/components/classes/AddClassForm';
import TagsPanel from '@/components/classes/TagsPanel';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProjectPermissions } from '@/hooks/usePermissions';

const ClassesManagement = () => {
  const { 
    classes, 
    addClass, 
    updateClass, 
    deleteClass,
    isLoading,
    refreshClasses
  } = useClasses();

  // Changing classes (the project's label set): the editor role or above (server rule).
  const { projectId } = useParams<{ projectId: string }>();
  const permissions = useProjectPermissions(projectId);
  const lockedReason = !permissions.isLoading && !permissions.can('edit')
    ? 'Changing classes needs the editor role in this project'
    : undefined;

  const handleRefresh = () => {
    refreshClasses();
  };


  // The project layout already provides the classes (one list for the page and the table).
  return (
      <div className="container mx-auto py-12 w-full">
        <ClassesHeader lockedReason={lockedReason} />

        <Tabs defaultValue="classes">
          <TabsList className="mb-4">
            <TabsTrigger value="classes" className="relative">
              Classes
              <span className="ml-1 text-xs text-black dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">{classes.length}</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="relative">
              Tags
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="classes">
            <ClassesTable 
              classes={classes}
              onUpdateClass={updateClass}
              onDeleteClass={deleteClass}
              isLoading={isLoading}
              onRefresh={handleRefresh}
              lockedReason={lockedReason}
            />
            <AddClassForm
              onAddClass={addClass}
              existingClasses={classes}
              lockedReason={lockedReason}
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
  );
};

export default ClassesManagement;