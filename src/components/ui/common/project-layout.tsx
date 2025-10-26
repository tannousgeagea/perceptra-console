import { FC } from 'react';
import SideBar from './sidebar';
import { Outlet } from 'react-router-dom';
import './project-layout.css';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ClassesProvider } from '@/contexts/ClassesContext';

const ProjectLayout: FC = () => {
  return (
    <ProjectProvider>
      <ClassesProvider>
        <div className="project-layout">
          <div className='project-layout-sidebar'>
            <SideBar />
          </div>
          <div className="project-layout-main">          
              <div className='project-layout-content'>
                <Outlet />
              </div>
            </div>
        </div>
      </ClassesProvider>
    </ProjectProvider>
  );
};

export default ProjectLayout;