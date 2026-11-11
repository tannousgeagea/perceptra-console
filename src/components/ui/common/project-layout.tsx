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

const ProjectLayout: FC = () => {
  const navigate = useNavigate();
  return (
    <ClassesProvider>
      <div className="project-layout bg-background">
        <div className='project-layout-sidebar'>
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