import { FC, Suspense } from 'react';
import ProjectSideBar from '@/components/layout/ProjectSidebar';
import { PageFallback } from '@/components/layout/PageFallback';
import { Outlet } from 'react-router-dom';
import './project-layout.css';
import { ClassesProvider } from '@/contexts/ClassesContext';
import { Button } from "@/components/ui/ui/button";
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useMobileNavStore } from '@/stores/mobileNavStore';

const ProjectLayout: FC = () => {
  const navigate = useNavigate();
  const projectMenuOpen = useMobileNavStore((s) => s.panel === 'project');
  return (
    <ClassesProvider>
      <div className="project-layout bg-background">
        {/* Phones: a drawer opened from the top bar's "Project menu". */}
        <div
          className={cn(
            'project-layout-sidebar',
            'fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:shadow-none',
            projectMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <ProjectSideBar />
        </div>
        <div className="project-layout-main">    
            <div className='project-layout-content gap-2'>
              <Button
                variant="ghost"
                onClick={() => navigate("/projects")}
                className="w-fit mx-6 my-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
              {/* The next project page loads here; the sidebar stays. */}
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
      </div>
    </ClassesProvider>
  );
};

export default ProjectLayout;